// core/sim/simService.ts

import type { AssemblyState } from "../assemblyTypes";

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
  entities: Record<string, SimEntity>;
  running: boolean;
  time: number; // simulation time (seconds)
  step: number; // fixed step count
}

type Subscriber = (state: SimState) => void;

/* -------------------------------------------------
   Constants
------------------------------------------------- */

const FIXED_DT = 1 / 60; // 60 Hz simulation step

/* -------------------------------------------------
   simService (Singleton)
------------------------------------------------- */

class SimService {
  // authoritative simulation state
  private _state: SimState = {
    entities: {},
    running: false,
    time: 0,
    step: 0,
  };

  // subscribers
  private subscribers = new Set<Subscriber>();

  // RAF loop
  private rafId: number | null = null;
  private lastFrameTime = 0;

  /* ---------------------------------------------
     Public accessors
  --------------------------------------------- */

  get state(): SimState {
    return this._state;
  }

  /* ---------------------------------------------
     Subscription API
  --------------------------------------------- */

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    // emit immediately
    fn(this._state);

    return () => {
      this.subscribers.delete(fn);
    };
  }

  private notify() {
    for (const fn of this.subscribers) {
      fn(this._state);
    }
  }

  /* ---------------------------------------------
     Snapshot from Assembly
  --------------------------------------------- */

  createSnapshotFromAssembly(assembly: AssemblyState) {
    const entities: Record<string, SimEntity> = {};

    // simple placeholder mapping:
    // every assembly node becomes one debug cube
    for (const nodeId in assembly.nodes) {
      const node = assembly.nodes[nodeId];

      entities[nodeId] = {
        id: nodeId,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      };
    }

    this._state = {
      entities,
      running: false,
      time: 0,
      step: 0,
    };

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
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.notify();
  }

  reset(recreateSnapshot = false) {
    this.pause();

    this._state.time = 0;
    this._state.step = 0;

    if (!recreateSnapshot) {
      for (const id in this._state.entities) {
        this._state.entities[id].position = { x: 0, y: 0, z: 0 };
        this._state.entities[id].rotation = { x: 0, y: 0, z: 0 };
      }
    }

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

    // clamp delta to avoid spiral of death
    const clampedDelta = Math.min(deltaMs / 1000, 0.05);

    // fixed step accumulation
    let accumulator = clampedDelta;
    while (accumulator >= FIXED_DT) {
      this.integrate(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    this.notify();
    this.rafId = requestAnimationFrame(this.loop);
  };

  /* ---------------------------------------------
     Integration Step (NO PHYSICS YET)
  --------------------------------------------- */

  private integrate(dt: number) {
    // placeholder motion logic (debug only)
    for (const ent of Object.values(this._state.entities)) {
      ent.rotation.y += dt * 0.5;
    }

    this._state.time += dt;
    this._state.step += 1;
  }
}

/* -------------------------------------------------
   Export singleton
------------------------------------------------- */

export const simService = new SimService();
