// core/sim/physicsEngine.ts

import type { SimState } from "./simState";

/**
 * Minimal headless physics engine (Phase C-3)
 * - Applies gravity
 * - Integrates velocity → position
 * - No collisions yet (Phase C-4)
 */
export type PhysicsOptions = {
  gravity?: [number, number, number];
};

export class PhysicsEngine {
  gravity: [number, number, number];

  constructor(opts?: PhysicsOptions) {
    this.gravity = opts?.gravity ?? [0, -9.81, 0];
  }

  initialize(state: SimState) {
    // Sync gravity into sim state
    state.gravity = this.gravity;
  }

  step(dt: number, state: SimState) {
    const gy = this.gravity[1];

    for (const ent of Object.values(state.entities)) {
      // Skip static entities
      if (ent.mass <= 0) continue;

      // Velocity MUST exist (Phase C-3 guarantee)
      ent.velocity.y += gy * dt;

      // Integrate position (semi-implicit Euler)
      ent.position.y += ent.velocity.y * dt;
    }
  }
}

