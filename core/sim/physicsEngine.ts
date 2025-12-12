// core/sim/physicsEngine.ts
import { SimState } from "./simState";

/**
 * Minimal PhysicsEngine facade for headless runs and tests.
 * In the UI we'll use @react-three/cannon, but this keeps a simple fallback.
 */
export type PhysicsOptions = { gravity?: [number, number, number] };

export class PhysicsEngine {
  gravity: [number, number, number];

  constructor(opts?: PhysicsOptions) {
    this.gravity = opts?.gravity ?? [0, -9.81, 0];
  }

  initialize(state: SimState) {
    state.gravity = this.gravity;
    // placeholder: map entity->body if we implement headless bodies
  }

  step(dt: number, state: SimState) {
    // naive gravity + velocity integrator for demonstration/testing
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
