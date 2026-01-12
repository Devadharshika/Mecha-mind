// core/sim/planning/planStep.ts

import type {
  PlanStepId,
  TemporalRelation,
  PlanningValidity,
} from "./planningTypes";

/**
 * Phase D-6.1 — PlanStep
 *
 * A PlanStep represents INTENDED control intent.
 * It does NOT execute, observe, or decide.
 */
export interface PlanStep {
  /** Stable step identifier */
  id: PlanStepId;

  /**
   * Symbolic intent type.
   * This maps to D-5 concepts but does not execute them.
   * Example: "joint-position", "joint-velocity"
   */
  intentType: string;

  /**
   * Symbolic targets derived from D-2 structure.
   * Examples:
   * - joint names
   * - link names
   * - end-effector identifiers
   */
  targets: string[];

  /**
   * Abstract ordering relation.
   * NOT a scheduler, NOT time-based.
   */
  temporalRelation: TemporalRelation;

  /**
   * Optional dependency references by ID only.
   * No logic, no evaluation.
   */
  dependsOn?: PlanStepId[];

  /**
   * Explicit validity marker.
   * Prevents silent assumptions.
   */
  validity: PlanningValidity;

  /**
   * Human / tooling annotations.
   * Never interpreted by the engine.
   */
  annotations?: Record<string, unknown>;
}
