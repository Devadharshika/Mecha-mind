// core/sim/telemetry/telemetryTypes.ts

/**
 * Phase D-4.1 — Telemetry Data Model
 *
 * Engine-agnostic, read-only telemetry contracts.
 *
 * ❌ No physics
 * ❌ No control
 * ❌ No mutation
 * ❌ No timing ownership
 *
 * ✅ Snapshot-based
 * ✅ Deterministic
 * ✅ Reset-safe
 */

/* ============================================================
 * TIME & WORLD IDENTITY
 * ============================================================
 */

/**
 * Canonical simulation time reference.
 * Every telemetry sample must include this.
 */
export interface TelemetryTime {
  /** Simulation time in seconds */
  time: number;

  /** Fixed simulation step index */
  step: number;

  /** World identity (changes on reset) */
  resetId: number;
}

/* ============================================================
 * AVAILABILITY
 * ============================================================
 */

/**
 * Explicit availability state for telemetry values.
 * Prevents NaNs, guessing, and silent failure.
 */
export type TelemetryAvailability =
  | "available"
  | "unsupported"
  | "temporarily-unavailable";

/* ============================================================
 * BASIC MATH TYPES
 * ============================================================
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/* ============================================================
 * JOINT TELEMETRY
 * ============================================================
 */

/**
 * Snapshot of joint-related telemetry.
 * Units depend on joint type (revolute / prismatic).
 */
export interface JointTelemetrySample {
  /** Stable joint identifier */
  jointId: string;

  /** Time reference */
  time: TelemetryTime;

  /** Availability of this telemetry */
  availability: TelemetryAvailability;

  /** Joint position (rad or meters) */
  position?: number;

  /** Joint velocity (rad/s or m/s) */
  velocity?: number;

  /** Applied force / torque (engine-dependent) */
  effort?: number;
}

/* ============================================================
 * BODY TELEMETRY
 * ============================================================
 */

/**
 * Snapshot of rigid body telemetry.
 * All values expressed in world frame.
 */
export interface BodyTelemetrySample {
  /** Stable body identifier */
  bodyId: string;

  /** Time reference */
  time: TelemetryTime;

  /** Availability of this telemetry */
  availability: TelemetryAvailability;

  /** World position */
  position?: Vec3;

  /** World orientation (quaternion) */
  orientation?: Quaternion;

  /** Linear velocity in world frame */
  linearVelocity?: Vec3;

  /** Angular velocity in world frame */
  angularVelocity?: Vec3;
}

/* ============================================================
 * TELEMETRY FRAME
 * ============================================================
 */

/**
 * Complete telemetry snapshot for a single simulation step.
 * This is the atomic unit pushed through the TelemetryBus.
 */
export interface TelemetryFrame {
  /** Time reference for this frame */
  time: TelemetryTime;

  /** Joint telemetry keyed by jointId */
  joints: Record<string, JointTelemetrySample>;

  /** Body telemetry keyed by bodyId */
  bodies: Record<string, BodyTelemetrySample>;
}
