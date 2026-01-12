// core/sim/control/ControlBus.ts

import type { MotionCommand } from "../motors/commands";

/**
 * Phase D-5 — Control Bus
 *
 * Holds control intent for a single simulation step.
 * Replaced every step. No history.
 *
 * ❌ No sensors
 * ❌ No physics
 * ❌ No timing ownership
 *
 * ✅ Deterministic
 * ✅ Reset-safe
 */
export class ControlBus {
  private commands: MotionCommand[] = [];
  private activeResetId: number | null = null;
  private activeStep: number | null = null;

  /**
   * Replace commands for the current step.
   */
  setFrame(
    resetId: number,
    step: number,
    cmds: MotionCommand[]
  ): void {
    this.activeResetId = resetId;
    this.activeStep = step;
    this.commands = [...cmds];
  }

  /**
   * Retrieve commands for the current step.
   */
  getFrame(
    resetId: number,
    step: number
  ): MotionCommand[] {
    if (
      this.activeResetId !== resetId ||
      this.activeStep !== step
    ) {
      return [];
    }
    return this.commands;
  }

  /**
   * Clear all control intent (on reset).
   */
  reset(): void {
    this.commands = [];
    this.activeResetId = null;
    this.activeStep = null;
  }
}
