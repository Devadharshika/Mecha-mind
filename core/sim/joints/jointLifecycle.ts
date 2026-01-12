// core/sim/joints/jointLifecycle.ts

import type { AssemblyJoint } from "@/core/assemblyTypes";
import type { BodyRegistry } from "./bodyRegistry";

/**
 * Phase D-3.2
 * Joint lifecycle manager (SEMANTIC ONLY).
 *
 * Responsibilities:
 * - Own joint existence across simulation lifecycle
 * - Bind joints to bodies *conceptually*
 * - Destroy/recreate cleanly on reset
 *
 * ❌ Does NOT touch physics
 * ❌ Does NOT import Rapier
 * ❌ Does NOT use React
 */
export class JointLifecycle {
  private joints: Map<string, AssemblyJoint> = new Map();

  constructor(
    private bodyRegistry: BodyRegistry
  ) {}

  /** Called when a simulation snapshot is created */
  registerJoints(joints: AssemblyJoint[]) {
    this.joints.clear();

    for (const joint of joints) {
      this.joints.set(joint.id, joint);
    }
  }

  /** Semantic validation hook (used later by validation layer) */
  validate() {
    for (const joint of this.joints.values()) {
      const parent = this.bodyRegistry.get(joint.parentId);
      const child = this.bodyRegistry.get(joint.childId);

      if (!parent || !child) {
        console.warn(
          `[JointLifecycle] Missing body for joint ${joint.id}`,
          { parent: joint.parentId, child: joint.childId }
        );
      }
    }
  }

  /** Reset-safe destruction */
  destroy() {
    this.joints.clear();
  }

  /** Introspection (debug / diagnostics) */
  getJointCount() {
    return this.joints.size;
  }
}
