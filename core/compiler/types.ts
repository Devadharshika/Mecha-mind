// core/compiler/types.ts

/**
 * Phase H-7 — Compiler Type Contracts (Runtime-Sealed)
 *
 * This file defines the compile-time boundary between:
 * DesignAssembly (L2)
 * and
 * Simulation initialization (L4 input)
 *
 * IMPORTANT:
 * - No logic here.
 * - No runtime behavior.
 * - No simulation imports.
 * - Types only.
 *
 * CRITICAL ARCHITECTURAL RULE:
 * CompiledSimulationSpec must be DESIGN-AGNOSTIC.
 * Simulation must never carry sourceNodeId or any design identifiers.
 * Identity after compile is runtime-only.
 */

/* ============================================================
   Compile Mode
   ============================================================ */

export type CompileMode =
  | "MANUAL"
  | "AUTO_DEV";

/* ============================================================
   Compile Error Model
   ============================================================ */

export interface CompileError {
  code: string;
  message: string;
  relatedId?: string; // refers to design-time id (compiler only)
}

/* ============================================================
   Compile Result
   ============================================================ */

export interface CompileResult {
  success: boolean;
  errors: CompileError[];

  /**
   * Present only if success === true
   */
  spec?: CompiledSimulationSpec;
}

/* ============================================================
   Simulation Specification (Compiler Output)
   ============================================================ */

export interface CompiledSimulationSpec {
  schemaVersion: string;
  compilerVersion: string;
  hash: string;

  bodies: SimBodySpec[];
  joints: SimJointSpec[];
  sensors: SimSensorSpec[];

  world: SimWorldSpec;
}

/* ============================================================
   Body Specification (Runtime Identity Only)
   ============================================================ */

export interface SimBodySpec {
  runtimeId: string;  // deterministic runtime id

  mass: number;
  inertiaTensor: [number, number, number];

  worldPosition: [number, number, number];
  worldRotation: [number, number, number, number];

  /**
   * Full extents in meters (X, Y, Z).
   * Used for truthful collider construction.
   * Simulation must derive collider geometry from this.
   */
  size: [number, number, number];

  linearDamping?: number;
  angularDamping?: number;

  friction?: number;
  restitution?: number;
}

/* ============================================================
   Joint Specification (Runtime Identity Only)
   ============================================================ */

export type SimJointType =
  | "REVOLUTE"
  | "PRISMATIC"
  | "FIXED";

export interface SimJointSpec {
  runtimeId: string;

  parentRuntimeId: string;
  childRuntimeId: string;

  type: SimJointType;

  axis?: [number, number, number];

  parentAnchor: [number, number, number];
  childAnchor: [number, number, number];

  limits?: {
    min: number;
    max: number;
  };

  motorEnabled?: boolean;
}

/* ============================================================
   Sensor Specification (Runtime Identity Only)
   ============================================================ */

export interface SimSensorSpec {
  runtimeId: string;

  attachedBodyRuntimeId: string;

  worldPosition: [number, number, number];
  worldRotation: [number, number, number, number];

  type: string;
}

/* ============================================================
   World Specification
   ============================================================ */

export interface SimWorldSpec {
  gravity: [number, number, number];

  timeStep: number;
  solverIterations: number;
}