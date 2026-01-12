// core/sim/telemetry/TelemetryBus.ts

import type { TelemetryFrame } from "./telemetryTypes";

/**
 * Phase D-4.3 — Telemetry Bus
 *
 * Append-only, deterministic timeline for telemetry frames.
 *
 * ❌ No pub/sub
 * ❌ No async callbacks
 * ❌ No physics access
 * ❌ No control logic
 *
 * ✅ Single writer (simulation)
 * ✅ Read-only consumers
 * ✅ Reset-safe
 */
export class TelemetryBus {
  /** Ordered list of telemetry frames (oldest → newest) */
  private frames: TelemetryFrame[] = [];

  /** Optional bounded history size */
  private readonly maxHistory: number | null;

  /** Active world identity */
  private activeResetId: number | null = null;

  constructor(options?: { maxHistory?: number }) {
    this.maxHistory =
      typeof options?.maxHistory === "number"
        ? Math.max(1, options.maxHistory)
        : null;
  }

  /* ============================================================
   * PUSH FRAME
   * ============================================================
   */

  /**
   * Append a telemetry frame.
   *
   * Enforces:
   * - resetId monotonicity
   * - strict step ordering
   * - immutability after insert
   */
  push(frame: TelemetryFrame): void {
    const { resetId, step } = frame.time;

    // First frame initializes resetId
    if (this.activeResetId === null) {
      this.activeResetId = resetId;
    }

    // Reject frames from an old or foreign world
    if (resetId !== this.activeResetId) {
      throw new Error(
        `[TelemetryBus] Rejecting frame: resetId mismatch (got ${resetId}, expected ${this.activeResetId})`
      );
    }

    const last = this.frames[this.frames.length - 1];

    // Enforce strict step ordering
    if (last && step <= last.time.step) {
      throw new Error(
        `[TelemetryBus] Rejecting frame: step ${step} is not greater than last step ${last.time.step}`
      );
    }

    // Freeze frame to prevent mutation
    const frozenFrame = deepFreeze(frame);

    this.frames.push(frozenFrame);

    // Enforce bounded history (deterministic eviction)
    if (this.maxHistory !== null && this.frames.length > this.maxHistory) {
      const overflow = this.frames.length - this.maxHistory;
      this.frames.splice(0, overflow);
    }
  }

  /* ============================================================
   * READ API (READ-ONLY)
   * ============================================================
   */

  /** Latest telemetry frame */
  latest(): TelemetryFrame | null {
    return this.frames.length > 0
      ? this.frames[this.frames.length - 1]
      : null;
  }

  /** Retrieve a frame by simulation step */
  getByStep(step: number): TelemetryFrame | null {
    return (
      this.frames.find((f) => f.time.step === step) ?? null
    );
  }

  /**
   * Retrieve telemetry history.
   * Returned array is a shallow copy (frames remain frozen).
   */
  history(limit?: number): TelemetryFrame[] {
    if (typeof limit === "number") {
      return this.frames.slice(
        Math.max(0, this.frames.length - limit)
      );
    }
    return [...this.frames];
  }

  /* ============================================================
   * RESET
   * ============================================================
   */

  /**
   * Reset the telemetry bus for a new world.
   * Must be called on simulation reset.
   */
  reset(newResetId: number): void {
    this.frames.length = 0;
    this.activeResetId = newResetId;
  }
}

/* ============================================================
 * UTIL — DEEP FREEZE
 * ============================================================
 */

/**
 * Recursively freeze an object to guarantee immutability.
 * This prevents accidental mutation by consumers.
 */
function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const key of Object.keys(obj as any)) {
      // @ts-ignore
      deepFreeze(obj[key]);
    }
  }
  return obj;
}
