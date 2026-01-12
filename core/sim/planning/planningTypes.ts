// core/sim/planning/planningTypes.ts

/**
 * Phase D-6.1 — Planning Primitives (FOUNDATION)
 *
 * DESIGN-ONLY TYPES.
 *
 * ❌ No execution
 * ❌ No scheduling logic
 * ❌ No simulation or telemetry access
 */

export type PlanId = string;
export type PlanStepId = string;
export type RobotId = string;

/**
 * Abstract temporal relationships between plan steps.
 * This represents INTENT ordering, not execution.
 */
export type TemporalRelation =
  | "SEQUENTIAL"
  | "PARALLEL"
  | "OPTIONAL"
  | "BLOCKING"
  | "DEPENDS_ON"
  | "CANCELS";

/**
 * Explicit validity markers.
 * Used to avoid silent assumptions.
 */
export type PlanningValidity =
  | "VALID"
  | "INVALID_REFERENCE"
  | "UNKNOWN";
