/* ============================================================
   D-6 ExecutionManager (Phase 1 Skeleton)

   Responsibilities:
   - Own plan lifecycle state
   - Track execution timing
   - Detect completion (basic)
   - NO planner logic
   - NO simulation logic
   - NO ControlBus integration yet

   This is orchestration only.
============================================================ */

import type { PlanResult, TaskState } from "./types";

export class ExecutionManager {

  private state: TaskState = "IDLE";

  private activePlan: PlanResult | null = null;

  private startTime = 0;
  private elapsed = 0;

  /* ----------------------------------------------------------
     Public State Access
  ---------------------------------------------------------- */

  getState(): TaskState {
    return this.state;
  }

  getActivePlan(): PlanResult | null {
    return this.activePlan;
  }

  /* ----------------------------------------------------------
     Plan Loading
  ---------------------------------------------------------- */

  loadPlan(plan: PlanResult, currentTime: number) {
    this.activePlan = plan;
    this.startTime = currentTime;
    this.elapsed = 0;
    this.state = "READY";
  }

  /* ----------------------------------------------------------
     Execution Control
  ---------------------------------------------------------- */

  start() {
    if (!this.activePlan) return;
    if (this.state !== "READY") return;

    this.state = "EXECUTING";
  }

  stop() {
    this.state = "IDLE";
    this.activePlan = null;
    this.elapsed = 0;
  }

  /* ----------------------------------------------------------
     Update Loop (Called externally per simulation step)
  ---------------------------------------------------------- */

  update(currentTime: number) {

    if (this.state !== "EXECUTING") return;
    if (!this.activePlan) return;

    this.elapsed = currentTime - this.startTime;

    // Basic completion check (Phase 1 only)
    if (this.elapsed >= this.activePlan.duration) {
      this.state = "COMPLETED";
      return;
    }

    // Sampling logic will be implemented in Phase 2
  }
}