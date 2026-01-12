// core/sim/planning/plan.ts

import type { PlanId, RobotId, PlanningValidity } from "./planningTypes";
import type { PlanStatus } from "./planStatus";
import type { PlanStep } from "./planStep";

/**
 * Phase D-6.1 — Plan
 *
 * A Plan is a declarative container of intended control steps.
 * It does NOT execute, schedule, observe, or validate itself.
 */
export interface Plan {
  /** Stable plan identifier */
  id: PlanId;

  /** Target robot (design-time identity) */
  robotId: RobotId;

  /**
   * Declared lifecycle status.
   * Set by external authority only.
   */
  status: PlanStatus;

  /**
   * Ordered or structured plan steps.
   * Ordering semantics are abstract at this phase.
   */
  steps: PlanStep[];

  /**
   * Declared assumptions.
   * These are NOT checked here.
   */
  assumptions?: string[];

  /**
   * Overall plan validity marker.
   * Independent of step execution.
   */
  validity: PlanningValidity;

  /**
   * Human / tooling annotations.
   * Never interpreted by the engine.
   */
  annotations?: Record<string, unknown>;
}
