// core/sim/types/simRobot.ts

import { SimRigidBody } from "./simBody";
import { SimJoint } from "./simJoint";

/**
 * Static simulation representation of a robot.
 * Fully reconstructible on reset.
 */
export interface SimRobot {
  /** Stable robot identifier */
  id: string;

  /** All rigid bodies belonging to this robot */
  bodies: SimRigidBody[];

  /** All passive joints belonging to this robot */
  joints: SimJoint[];

  /** Root body for hierarchy resolution */
  rootBodyId: string;
}
