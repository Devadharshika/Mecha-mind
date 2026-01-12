// core/sim/types/simJoint.ts

import { Vec3 } from "./math";

/**
 * Passive joint definition connecting two rigid bodies.
 * No motors, no control, no runtime mutation.
 */
export type SimJointType =
  | "fixed"
  | "revolute"
  | "prismatic";

export interface SimJoint {
  /** Stable joint identifier */
  id: string;

  /** Constraint type */
  type: SimJointType;

  /** Body linkage */
  parentBodyId: string;
  childBodyId: string;

  /** Anchor points in local body frames */
  parentAnchor: Vec3;
  childAnchor: Vec3;

  /** Motion axis (required for revolute / prismatic) */
  axis?: Vec3;

  /** Passive limits (radians or meters depending on joint) */
  limits?: {
    min: number;
    max: number;
  };

  /** Back-reference to Assembly joint */
  sourceJointId: string;
}
