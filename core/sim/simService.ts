// core/sim/simService.ts

import type { AssemblyState } from "../assemblyTypes";

import { TelemetryBus } from "./telemetry/TelemetryBus";
import type { TelemetryFrame } from "./telemetry/telemetryTypes";
import { JointTelemetrySampler } from "./telemetry/samplers/JointTelemetrySampler";
import { BodyTelemetrySampler } from "./telemetry/samplers/BodyTelemetrySampler";

import { ControlBus } from "./control/ControlBus";
import type { MotionCommand } from "./motors/commands";

import { JointPhysicsEngine } from "./joints/JointPhysicsEngine";

// ⚠️ D-3 Physics Engine (RAW)
// We keep this import explicit and isolated
import * as RAPIER from "@dimforge/rapier3d-compat";

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
  resetId: number;                 // 🔑 world identity
  entities: Record<string, SimEntity>;
  running: boolean;
  time: number; // simulation time (seconds)
  step: number; // fixed step count
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
  // 🔑 reset counter
  private resetCounter = 0;

  // authoritative simulation state
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
  private lastFrameTime = 0;

  /* -------------------------------------------------
     D-3 Physics World (EXECUTION)
  ------------------------------------------------- */

  private rapier = RAPIER;
  private physicsWorld: RAPIER.World | null = null;
  private jointPhysics: JointPhysicsEngine | null = null;

  /* -------------------------------------------------
     D-4 Telemetry (READ-ONLY)
  ------------------------------------------------- */

  private telemetryBus = new TelemetryBus({ maxHistory: 300 });
  private jointSampler = new JointTelemetrySampler(null);
  private bodySampler = new BodyTelemetrySampler(null);

  /* -------------------------------------------------
     D-5 Control (INTENT ONLY)
  ------------------------------------------------- */

  private controlBus = new ControlBus();

  /* ---------------------------------------------
     Public accessors
  --------------------------------------------- */

  get state(): SimState {
    return this._state;
  }

  get telemetry(): TelemetryBus {
    return this.telemetryBus;
  }

  get control(): ControlBus {
    return this.controlBus;
  }

  /* ---------------------------------------------
     Subscription API
  --------------------------------------------- */

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this._state);
    return () => this.subscribers.delete(fn);
  }

  private notify() {
    for (const fn of this.subscribers) fn(this._state);
  }

  /* ---------------------------------------------
     Snapshot from Assembly
  --------------------------------------------- */

  createSnapshotFromAssembly(assembly: AssemblyState) {
    const entities: Record<string, SimEntity> = {};

    for (const nodeId in assembly.nodes) {
      entities[nodeId] = {
        id: nodeId,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      };
    }

    this.lastSnapshot = structuredClone(entities);

    this._state = {
      resetId: ++this.resetCounter,
      entities,
      running: false,
      time: 0,
      step: 0,
    };

    /* -----------------------------------------
       D-3 World Initialization
    ----------------------------------------- */

    this.physicsWorld = new this.rapier.World({
      x: 0,
      y: -9.81,
      z: 0,
    });

    this.jointPhysics = new JointPhysicsEngine(
      this.physicsWorld,
      this.rapier
    );

    // Wire physics into telemetry samplers
    this.jointSampler = new JointTelemetrySampler(this.physicsWorld);
    this.bodySampler = new BodyTelemetrySampler(this.physicsWorld);

    // Reset auxiliary layers
    this.telemetryBus.reset(this._state.resetId);
    this.controlBus.reset();

    this.notify();
  }

  /* ---------------------------------------------
     Simulation Control
  --------------------------------------------- */

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

  reset() {
    this.pause();
    if (!this.lastSnapshot) return;

    this._state = {
      resetId: ++this.resetCounter,
      entities: structuredClone(this.lastSnapshot),
      running: false,
      time: 0,
      step: 0,
    };

    this.physicsWorld = null;
    this.jointPhysics = null;

    this.telemetryBus.reset(this._state.resetId);
    this.controlBus.reset();

    this.notify();
  }

  stepOnce() {
    this.integrate(FIXED_DT);
    this.notify();
  }

  /* ---------------------------------------------
     Main Loop
  --------------------------------------------- */

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

  /* ---------------------------------------------
     Integration Step
  --------------------------------------------- */

  private integrate(dt: number) {
    // --- Physics step (D-3) ---
    if (this.physicsWorld) {
      this.physicsWorld.timestep = dt;
      this.physicsWorld.step();
    }

    this._state.time += dt;
    this._state.step += 1;

    /* -----------------------------------------
       D-4 Telemetry Sampling
    ----------------------------------------- */

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

    /* -----------------------------------------
       D-5 Control → D-3.5 Motion
    ----------------------------------------- */

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

/* -------------------------------------------------
   Export singleton
------------------------------------------------- */

export const simService = new SimService();
