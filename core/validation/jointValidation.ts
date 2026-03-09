// core/validation/jointValidation.ts

import type {
  AssemblyState,
  AssemblyJoint,
} from "../assemblyTypes";

/* =========================================================
   Validation Result Type
   ========================================================= */

export type JointValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

/* =========================================================
   Joint Validation (Design-Time Only)
   Pure — No Mutation
   ========================================================= */

export function validateJoint(
  state: AssemblyState,
  joint: AssemblyJoint
): JointValidationResult {
  const parent = state.nodes[joint.parentId];
  const child = state.nodes[joint.childId];

  /* ---------------------------------------------------------
     1. Node existence
     --------------------------------------------------------- */

  if (!parent) {
    return { ok: false, reason: "Parent node does not exist" };
  }

  if (!child) {
    return { ok: false, reason: "Child node does not exist" };
  }

  /* ---------------------------------------------------------
     2. Root protection
     Root may not be child in any joint.
     --------------------------------------------------------- */

  if (child.id === state.rootId) {
    return {
      ok: false,
      reason: "Root node cannot be a child in a joint",
    };
  }

  /* ---------------------------------------------------------
     3. Self-connection
     --------------------------------------------------------- */

  if (parent.id === child.id) {
    return {
      ok: false,
      reason: "Joint cannot connect a node to itself",
    };
  }

  /* ---------------------------------------------------------
     4. Structural consistency (authoritative rule)
     Joint must connect direct structural parent → child
     --------------------------------------------------------- */

  const isDirectHierarchy =
    child.parentId === parent.id;

  if (!isDirectHierarchy) {
    return {
      ok: false,
      reason: "Joint must connect direct parent-child nodes",
    };
  }

  /* ---------------------------------------------------------
     5. Structural symmetry confirmation
     Validation does not blindly trust reducer state.
     --------------------------------------------------------- */

  const parentHasChild =
    parent.children.includes(child.id);

  if (!parentHasChild) {
    return {
      ok: false,
      reason:
        "Structural inconsistency detected between parent and child",
    };
  }

  /* ---------------------------------------------------------
     6. Single joint per structural edge
     Only one joint allowed per parent-child pair.
     --------------------------------------------------------- */

  const existingEdgeJoint = Object.values(state.joints).some(
    (j) =>
      j.parentId === joint.parentId &&
      j.childId === joint.childId
  );

  if (existingEdgeJoint) {
    return {
      ok: false,
      reason:
        "A joint already exists for this structural edge",
    };
  }

  /* ---------------------------------------------------------
     7. Reverse edge prevention
     Prevent child → parent duplication
     --------------------------------------------------------- */

  const reverseEdgeJoint = Object.values(state.joints).some(
    (j) =>
      j.parentId === joint.childId &&
      j.childId === joint.parentId
  );

  if (reverseEdgeJoint) {
    return {
      ok: false,
      reason:
        "Reverse joint already exists between nodes",
    };
  }

  /* ---------------------------------------------------------
     8. Axis validation for motion joints
     Revolute and prismatic require a non-zero axis.
     --------------------------------------------------------- */

  if (
    joint.type === "revolute" ||
    joint.type === "prismatic"
  ) {
    if (!joint.axis) {
      return {
        ok: false,
        reason:
          "Revolute and prismatic joints require an axis",
      };
    }

    const [x, y, z] = joint.axis;
    const magnitude = Math.sqrt(
      x * x + y * y + z * z
    );

    if (magnitude === 0) {
      return {
        ok: false,
        reason:
          "Joint axis must be a non-zero vector",
      };
    }
  }

  return { ok: true };
}