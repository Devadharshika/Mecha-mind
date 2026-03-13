import type { AssemblyState } from "../assemblyTypes";
import type { CompiledSimulationSpec } from "../compiler/types";

import { TelemetryBus } from "./telemetry/TelemetryBus";
import type { TelemetryFrame } from "./telemetry/telemetryTypes";
import { JointTelemetrySampler } from "./telemetry/samplers/JointTelemetrySampler";
import { BodyTelemetrySampler } from "./telemetry/samplers/BodyTelemetrySampler";

import { ControlBus } from "./control/ControlBus";
import type { MotionCommand } from "./motors/commands";

import { JointPhysicsEngine } from "./joints/JointPhysicsEngine";

import * as RAPIER from "@dimforge/rapier3d-compat";
import { ExecutionManager } from "../planning/ExecutionManager";

/* -------------------------------------------------
   Types
------------------------------------------------- */

export type Vec3 = { x: number; y: number; z: number };

export interface SimEntity {
  id: string;
  position: Vec3;
  rotation: Vec3;
}

export interface SimState {
  resetId: number;
  entities: Record<string, SimEntity>;
  running: boolean;
  time: number;
  step: number;
}

type Subscriber = (state: SimState) => void;

/* -------------------------------------------------
   Constants
------------------------------------------------- */

const FIXED_DT = 1 / 60;

/* -------------------------------------------------
   simService (Singleton)
------------------------------------------------- */

class SimService {

  private resetCounter = 0;

  private _state: SimState = {
    resetId: 0,
    entities: {},
    running: false,
    time: 0,
    step: 0,
  };

  private lastSnapshot: Record<string, SimEntity> | null = null;
  private subscribers = new Set<Subscriber>();
  private rafId: number | null = null;
  private currentSpecHash: string | null = null;
  private currentSpec: CompiledSimulationSpec | null = null;
  private lastFrameTime = 0;

  /* -------------------------------------------------
     D-3 Physics World
  ------------------------------------------------- */

  private rapier = RAPIER;
  private rapierInitialized = false;
  private physicsWorld: RAPIER.World | null = null;
  private jointPhysics: JointPhysicsEngine | null = null;

  /* -------------------------------------------------
     D-3.2 Body Registry
  ------------------------------------------------- */

  private bodyHandles = new Map<string, RAPIER.RigidBody>();

  /* -------------------------------------------------
     D-4 Telemetry
  ------------------------------------------------- */

  private telemetryBus = new TelemetryBus({ maxHistory: 300 });
  private jointSampler = new JointTelemetrySampler(null);
  private bodySampler = new BodyTelemetrySampler(null);

  /* -------------------------------------------------
     D-5 Control
  ------------------------------------------------- */

  private controlBus = new ControlBus();

    /* -------------------------------------------------
     D-6 Planning (Execution Orchestration)
  ------------------------------------------------- */

  private executionManager = new ExecutionManager();

  /* --------------------------------------------- */

  get state(): SimState {
    return this._state;
  }

  get telemetry(): TelemetryBus {
    return this.telemetryBus;
  }

  get control(): ControlBus {
    return this.controlBus;
  }
    get execution() {
    return this.executionManager;
  }

  /* --------------------------------------------- */

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this._state);
    return () => this.subscribers.delete(fn);
  }

  private notify() {
    for (const fn of this.subscribers) fn(this._state);
  }

  /* -------------------------------------------------
   Spec-driven initialization
------------------------------------------------- */

async initializeFromSpec(spec: CompiledSimulationSpec) {

  Object.freeze(spec);
  Object.freeze(spec.bodies);
  Object.freeze(spec.joints);

  // If hash changed, rebuild
  if (this.currentSpecHash !== spec.hash) {
    this.currentSpecHash = spec.hash;
    this.currentSpec = spec;

    await this.rebuildWorldFromSpec(spec);
    return;
  }

  // If identical spec, do nothing
  console.warn("[SimService] Spec identical — skipping reinit");
}
  /* --------------------------------------------- */

  start() {
    if (this._state.running) return;
    this._state.running = true;
    this.lastFrameTime = performance.now();
    this.loop();
    this.notify();
  }

  pause() {
    if (!this._state.running) return;
    this._state.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.notify();
  }
  /* -------------------------------------------------
   Deterministic Single Step (Research API)
------------------------------------------------- */

stepOnce(dt: number = FIXED_DT) {

  if (!this.physicsWorld) return;

  // Ensure simulation is not running
  this.pause();

  this.integrate(dt);

  this.notify();
}

  async reset() {

  this.pause();

  if (!this.currentSpec) {
    console.warn("[SimService] Reset called without compiled spec.");
    return;
  }

  await this.rebuildWorldFromSpec(this.currentSpec);
}
  /* --------------------------------------------- */

  private loop = () => {

    if (!this._state.running) return;

    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;

    this.lastFrameTime = now;

    let acc = Math.min(deltaMs / 1000, 0.05);

    while (acc >= FIXED_DT) {
      this.integrate(FIXED_DT);
      acc -= FIXED_DT;
    }

    this.notify();
    this.rafId = requestAnimationFrame(this.loop);
  };

  /* --------------------------------------------- */
private async rebuildWorldFromSpec(spec: CompiledSimulationSpec) {

  if (!this.rapierInitialized) {
    await this.rapier.init();
    this.rapierInitialized = true;
  }

  this.physicsWorld = new this.rapier.World({
    x: spec.world.gravity[0],
    y: spec.world.gravity[1],
    z: spec.world.gravity[2],
  });

  const groundDesc = this.rapier.RigidBodyDesc.fixed();
  groundDesc.setTranslation(0, -5, 0);
  const groundBody = this.physicsWorld.createRigidBody(groundDesc);
  const groundCollider = this.rapier.ColliderDesc.cuboid(20, 0.2, 20);
  this.physicsWorld.createCollider(groundCollider, groundBody);

  this.bodyHandles.clear();

  this.jointPhysics = new JointPhysicsEngine(
    this.physicsWorld,
    this.rapier
  );

  const entities: Record<string, SimEntity> = {};

  for (const body of spec.bodies) {

    const desc = this.rapier.RigidBodyDesc.dynamic();

    desc.setTranslation(
      body.worldPosition[0],
      body.worldPosition[1],
      body.worldPosition[2]
    );

    desc.setRotation({
      x: body.worldRotation[0],
      y: body.worldRotation[1],
      z: body.worldRotation[2],
      w: body.worldRotation[3],
    });

    const rb = this.physicsWorld.createRigidBody(desc);

    const [sx, sy, sz] = body.size;

// Rapier expects HALF extents
const colliderDesc = this.rapier.ColliderDesc.cuboid(
  sx / 2,
  sy / 2,
  sz / 2
);

this.physicsWorld.createCollider(colliderDesc, rb);

    this.bodyHandles.set(body.runtimeId, rb);

    entities[body.runtimeId] = {
      id: body.runtimeId,
      position: {
        x: body.worldPosition[0],
        y: body.worldPosition[1],
        z: body.worldPosition[2],
      },
      rotation: { x: 0, y: 0, z: 0 },
    };
  }

  for (const joint of spec.joints) {

    const parent = this.bodyHandles.get(joint.parentRuntimeId);
    const child = this.bodyHandles.get(joint.childRuntimeId);

    if (!parent || !child) continue;

    this.jointPhysics?.createJoint(
      {
        id: joint.runtimeId,
        type: joint.type.toLowerCase(),
        parentAnchor: { x: 0, y: 0, z: 0 },
        childAnchor: { x: 0, y: 0, z: 0 },
      } as any,
      parent,
      child
    );
  }

  this.lastSnapshot = structuredClone(entities);

  this._state = {
    resetId: ++this.resetCounter,
    entities,
    running: false,
    time: 0,
    step: 0,
  };

  this.jointSampler = new JointTelemetrySampler(this.physicsWorld);
  this.bodySampler = new BodyTelemetrySampler(this.physicsWorld);

  this.telemetryBus.reset(this._state.resetId);
  this.controlBus.reset();

  this.notify();
}
  private integrate(dt: number) {
  

    if (this.physicsWorld) {
      this.physicsWorld.timestep = dt;
      this.physicsWorld.step();
    }

    /* -----------------------------------------
       Transform Sync
    ----------------------------------------- */

    for (const [runtimeId, body] of this.bodyHandles.entries()) {

      const translation = body.translation();
     
      const rotation = body.rotation();

      const entity = this._state.entities[runtimeId];
      if (!entity) continue;

      entity.position.x = translation.x;
      entity.position.y = translation.y;
      entity.position.z = translation.z;

      entity.rotation.x = rotation.x;
      entity.rotation.y = rotation.y;
      entity.rotation.z = rotation.z;
    }

    this._state.time += dt;
    this._state.step += 1;

    // --------------------------------------------------
// D-6 Execution Update (Phase 2 Minimal Wiring)
// --------------------------------------------------

this.executionManager.update(this._state.time);

    const frame: TelemetryFrame = {
      time: {
        time: this._state.time,
        step: this._state.step,
        resetId: this._state.resetId,
      },
      joints: {},
      bodies: {},
    };

    for (const bodyId of Object.keys(this._state.entities)) {
      frame.bodies[bodyId] = this.bodySampler.sampleBody(
        bodyId,
        frame.time
      );
    }

    this.telemetryBus.push(frame);

    const commands: MotionCommand[] =
      this.controlBus.getFrame(
        this._state.resetId,
        this._state.step
      );

    if (this.jointPhysics) {
      for (const cmd of commands) {
        this.jointPhysics.applyMotionCommand(cmd);
      }
    }
  }
}

export const simService = new SimService();
/* -------------------------------------------------
   DEBUG ONLY: expose simService to browser console
   REMOVE or COMMENT before production hardening
------------------------------------------------- */
if (typeof window !== "undefined") {
  (window as any).simService = simService;
}