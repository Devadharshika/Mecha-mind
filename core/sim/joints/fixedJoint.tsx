// core/sim/joints/fixedJoint.tsx
"use client";

import type { AssemblyJoint } from "@/core/assemblyTypes";
import type { RigidBodyApi } from "@react-three/rapier";

/**
 * Phase D-3.2 — Fixed Joint (SEMANTIC ONLY)
 *
 * ❗ Intentionally DOES NOT bind to Rapier yet.
 * ❗ react-three-rapier does not expose a FixedJoint component.
 * ❗ Hook-based joints are unsafe for our architecture.
 *
 * Real physics binding will happen in Phase D-4
 * using a dedicated joint engine layer.
 */
export function FixedJointConstraint({
  joint,
  bodyA,
  bodyB,
}: {
  joint: AssemblyJoint;
  bodyA?: RigidBodyApi;
  bodyB?: RigidBodyApi;
}) {
  if (!bodyA || !bodyB) {
    // Bodies not ready yet — this is EXPECTED
    return null;
  }

  // 🔒 Phase D-3.2 STOP POINT
  // Joint exists semantically, not physically
  // Used for validation, graph correctness, and future binding

  return null;
}
