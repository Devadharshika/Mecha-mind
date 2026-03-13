/* ============================================================
   D-6 Planning Layer — Core Types (Phase 1 Skeleton)

   This file defines minimal lifecycle and failure contracts
   for the D-6 Planning layer.

   IMPORTANT:
   - No runtime logic.
   - No simulation imports.
   - No control imports.
   - Types only.
============================================================ */

/* ============================================================
   Task Lifecycle State (D-6)
============================================================ */

export type TaskState =
  | "IDLE"
  | "PLANNING"
  | "READY"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED";

/* ============================================================
   Failure Reasons (Explicit, Typed)
============================================================ */

export type FailureReason =
  | "DIVERGENCE"
  | "TIMEOUT"
  | "CONSTRAINT_VIOLATION"
  | "PHYSICS_INSTABILITY"
  | "PLANNING_FAILURE";

  /* ============================================================
   D-6 Plan Result (Phase 1 Minimal Contract)

   NOTE:
   - This is a temporary discrete representation.
   - Hybrid continuous model will replace this later.
   - ExecutionManager will consume this.
============================================================ */

export interface IntentFrame {
  timeOffset: number; // seconds from plan start

  /**
   * jointId -> target position (radians or meters)
   * Uses runtime joint IDs (opaque).
   */
  jointTargets: Record<string, number>;
}

export interface PlanResult {
  schemaVersion: string;

  planId: string;
  taskId: string;

  /**
   * Total duration in seconds.
   */
  duration: number;

  /**
   * Time-indexed intent frames.
   * Must be deterministic and ordered by timeOffset.
   */
  timeline: IntentFrame[];
}