// core/sim/types/simBody.ts

import { Vec3, Quat } from "./math";

/**
 * Physical body representation inside simulation.
 * Static definition only — no runtime state.
 */
export type SimBodyType =
  | "dynamic"
  | "fixed"
  | "kinematic"; // future-safe

export interface SimRigidBody {
  /** Stable simulation identifier */
  id: string;

  /** World-space pose (authoritative on reset) */
  position: Vec3;
  rotation: Quat;

  /** Physics classification */
  bodyType: SimBodyType;

  /** Mass in kilograms */
  mass: number;

  /** Optional explicit inertia tensor (local space) */
  inertia?: Vec3;

  /** Optional collider reference (resolved later) */
  colliderId?: string;

  /** Back-reference to Assembly */
  sourcePartId: string;

  /** Optional debug label */
  label?: string;
}
