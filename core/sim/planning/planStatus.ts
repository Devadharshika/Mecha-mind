// core/sim/planning/planStatus.ts

/**
 * Phase D-6.1 — Plan Lifecycle States
 *
 * These states are DECLARED by external authority.
 * They are NEVER inferred from execution, telemetry,
 * or simulation outcomes.
 */

export type PlanStatus =
  | "DRAFT"
  | "READY"
  | "QUEUED"
  | "CANCELLED"
  | "INVALID"
  | "ABANDONED";

/**
 * ❌ Explicitly forbidden in D-6:
 * - SUCCEEDED
 * - FAILED
 * - COMPLETED
 *
 * Those require observation and belong to later phases.
 */
