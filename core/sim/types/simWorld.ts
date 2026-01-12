// core/sim/types/simWorld.ts

import { SimRobot } from "./simRobot";

/**
 * Deterministic simulation world definition.
 * Rebuilt on every hard reset.
 */
export interface SimWorld {
  /** All robots present in the simulation */
  robots: SimRobot[];

  /** Optional deterministic seed */
  seed?: number;
}
