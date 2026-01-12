// core/sim/motors/commands.ts

/**
 * Phase D-3.5.2
 * Motion command definitions.
 *
 * A motion command represents INTENT,
 * not execution or control.
 *
 * ❌ No physics
 * ❌ No Rapier
 * ❌ No feedback
 */

export type MotionMode = "position" | "velocity";

/**
 * Single motion request applied to a joint motor.
 */
export interface MotionCommand {
  /** Target joint */
  jointId: string;

  /** How the joint should move */
  mode: MotionMode;

  /** Target position (rad / m) OR velocity (rad/s / m/s) */
  target: number;

  /**
   * Optional duration (seconds).
   * If undefined, command persists until replaced.
   */
  duration?: number;
}
