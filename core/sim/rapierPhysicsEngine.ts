// core/sim/rapierPhysicsEngine.ts

import * as Rapier from "@dimforge/rapier3d-compat";

import type { SimState } from "./simState";
import type { SimJoint } from "./types/simJoint";
import type { SimRigidBody } from "./types/simBody";

import { JointPhysicsEngine } from "./joints/JointPhysicsEngine";

/**
 * Phase D-3.4-B
 * RapierPhysicsEngine (RUNTIME SKELETON)
 *
 * Authoritative physics runtime.
 * Owns:
 * - Rapier World
 * - Rigid bodies
 * - JointPhysicsEngine
 *
 * ❌ No React
 * ❌ No hooks
 * ❌ No UI
 * ❌ No motors (yet)
 */
export class RapierPhysicsEngine {
  private world: Rapier.World | null = null;
  private jointEngine: JointPhysicsEngine | null = null;

  // Body registry: bodyId -> Rapier rigid body
  private bodies = new Map<string, Rapier.RigidBody>();

  /* ============================================================
   * INITIALIZATION
   * ============================================================ */

  initialize(state: SimState) {
    // Create Rapier world
    this.world = new Rapier.World({
      x: state.gravity?.[0] ?? 0,
      y: state.gravity?.[1] ?? -9.81,
      z: state.gravity?.[2] ?? 0,
    });

    // Create joint engine AFTER world exists
    this.jointEngine = new JointPhysicsEngine(this.world, Rapier);
  }

  /* ============================================================
   * BODY CREATION (SKELETON ONLY)
   * ============================================================ */

  createBodies(bodies: SimRigidBody[]) {
    if (!this.world) return;

    // Body creation will be implemented fully later
    // This skeleton only reserves lifecycle ownership
    for (const body of bodies) {
      // placeholder — implemented in later step
      // const rb = this.world.createRigidBody(...)
      // this.bodies.set(body.id, rb)
    }
  }

  /* ============================================================
   * JOINT REGISTRATION
   * ============================================================ */

  registerJoints(joints: SimJoint[]) {
    if (!this.jointEngine) return;

    for (const joint of joints) {
      const parent = this.bodies.get(joint.parentBodyId);
      const child = this.bodies.get(joint.childBodyId);

      if (!parent || !child) continue;

      this.jointEngine.createJoint(joint, parent, child);
    }
  }

  /* ============================================================
   * STEP
   * ============================================================ */

  step(dt: number) {
    if (!this.world) return;
    this.world.step();
  }

  /* ============================================================
   * RESET (DETERMINISTIC)
   * ============================================================ */

  reset() {
    // Destroy joints first
    this.jointEngine?.reset();
    this.jointEngine = null;

    // Destroy bodies
    this.bodies.clear();

    // Destroy world
    this.world = null;
  }
}
