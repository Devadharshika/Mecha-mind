// core/sim/motors/types.ts

/**
 * Phase D-3.5.1
 * Motor data structures (ENGINE-AGNOSTIC)
 *
 * This file defines WHAT a motor is,
 * not how it is executed.
 *
 * ❌ No physics
 * ❌ No Rapier
 * ❌ No motion logic
 */

export type MotorType = "revolute" | "prismatic";

/**
 * Static motor capability attached to a joint.
 * This is design-time + runtime safe.
 */
export interface MotorSpec {
  /** Joint this motor controls */
  jointId: string;

  /** Motion type */
  type: MotorType;

  /** Hard physical limits */
  limits: {
    min: number;
    max: number;
  };

  /** Maximum force or torque allowed */
  maxForce: number;
}
