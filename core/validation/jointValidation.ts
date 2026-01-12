// core/validation/jointValidation.ts

import type {
  AssemblyState,
  AssemblyJoint,
  AssemblyNode,
} from "../assemblyTypes";

/* =========================================================
   Validation Result Type
   ========================================================= */

export type JointValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/* =========================================================
   Category Compatibility Rules (Design-Time)
   ========================================================= */

function isCategoryCompatible(
  parent: AssemblyNode,
  child: AssemblyNode
): boolean {
  // Conservative baseline:
  // structure can support anything
  if (parent.category === "structure") {
    return true;
  }

  return false;
}

/* =========================================================
   Main Joint Validation Function
   ========================================================= */

export function validateJoint(
  state: AssemblyState,
  joint: AssemblyJoint
): JointValidationResult {
  const parent = state.nodes[joint.parentId];
  const child = state.nodes[joint.childId];

  if (!parent) {
    return { ok: false, reason: "Parent node does not exist" };
  }

  if (!child) {
    return { ok: false, reason: "Child node does not exist" };
  }

  if (parent.id === child.id) {
    return { ok: false, reason: "Joint cannot connect a node to itself" };
  }

  const duplicate = Object.values(state.joints).some(
    (j) =>
      j.parentId === joint.parentId &&
      j.childId === joint.childId
  );

  if (duplicate) {
    return { ok: false, reason: "Duplicate joint already exists" };
  }

  if (!isCategoryCompatible(parent, child)) {
    return {
      ok: false,
      reason: `Cannot attach ${child.category} to ${parent.category}`,
    };
  }

  return { ok: true };
}
