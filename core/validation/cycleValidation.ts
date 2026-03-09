// core/validation/cycleValidation.ts

import type { AssemblyState } from "../assemblyTypes";

/* =========================================================
   Cycle Validation (Structure-Level)
   Pure — No Mutation
   Ensures assembly graph remains acyclic (tree invariant)
   ========================================================= */

export type CycleValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/* =========================================================
   Detect Cycle If childId Is Attached Under parentId
   ---------------------------------------------------------
   This checks whether parentId is already a descendant
   of childId, which would create a cycle.
   ========================================================= */

export function validateNoCycle(
  state: AssemblyState,
  parentId: string,
  childId: string
): CycleValidationResult {

  // If trying to attach a node to itself
  if (parentId === childId) {
    return {
      ok: false,
      reason: "Cannot create cycle: node cannot be parent of itself",
    };
  }

  // Walk upward from parentId
  let current = state.nodes[parentId];

  while (current.parentId !== null) {
    if (current.parentId === childId) {
      return {
        ok: false,
        reason: "Cycle detected in assembly hierarchy",
      };
    }

    current = state.nodes[current.parentId];
  }

  return { ok: true };
}