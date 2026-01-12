// core/sim/types/simSnapshot.ts

import { SimWorld } from "./simWorld";

/**
 * Immutable snapshot produced by Assembly → Simulation adapter.
 * Used to construct or reset the simulation world.
 */
export interface SimulationSnapshot {
  /** Complete world definition */
  world: SimWorld;

  /** Creation timestamp (for trace / debug only) */
  createdAt: number;
}
