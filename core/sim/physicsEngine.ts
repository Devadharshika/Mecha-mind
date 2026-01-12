// core/sim/physicsEngine.ts

import { SimState } from "./simState";
import type { SimJoint } from "./types/simJoint";

/**
 * Minimal PhysicsEngine facade for headless runs and tests.
 *
 * IMPORTANT:
 * - This engine does NOT run Rapier
 * - This engine does NOT enforce joints physically
 * - It provides lifecycle parity with runtime engines
 *
 * Real joint physics is handled by a Rapier-backed engine
 * (e.g. in the UI runtime).
 */
export type PhysicsOptions = {
  gravity?: [number, number, number];
};

export class PhysicsEngine {
  gravity: [number, number, number];

  // 🔑 Stored for parity & verification only
  protected joints: SimJoint[] = [];

  constructor(opts?: PhysicsOptions) {
    this.gravity = opts?.gravity ?? [0, -9.81, 0];
  }

  /**
   * Initialize simulation state.
   * Headless engine only applies gravity metadata.
   */
  initialize(state: SimState) {
    state.gravity = this.gravity;
  }

  /**
   * Register joints from snapshot.
   * NO physics enforcement here.
   * Used for:
   * - verification
   * - lifecycle parity
   * - future replay/debug tooling
   */
  registerJoints(joints: SimJoint[]) {
    this.joints = joints;
  }

  /**
   * Clear all runtime state (called on reset).
   */
  reset() {
    this.joints = [];
  }

  /**
   * Naive gravity + velocity integrator
   * (intentionally simple and deterministic).
   */
  step(dt: number, state: SimState) {
    for (const id of Object.keys(state.entities)) {
      const e = state.entities[id];
      if (!e.mass || e.mass <= 0) continue;

      if (!e.meta) e.meta = {};

      const v = (e.meta.v as [number, number, number]) ?? [0, 0, 0];

      v[0] += this.gravity[0] * dt;
      v[1] += this.gravity[1] * dt;
      v[2] += this.gravity[2] * dt;

      e.position = [
        e.position[0] + v[0] * dt,
        e.position[1] + v[1] * dt,
        e.position[2] + v[2] * dt,
      ];

      e.meta.v = v;
    }
  }
}
