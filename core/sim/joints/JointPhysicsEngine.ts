// core/sim/joints/JointPhysicsEngine.ts

import type { SimJoint } from "../types/simJoint";
import type { MotorSpec } from "../motors/types";
import type { MotionCommand } from "../motors/commands";

/**
 * Phase D-3.3 → D-3.5
 * Joint Physics Engine (RAW RAPIER)
 *
 * Responsibilities:
 * - Own creation & destruction of physics joints
 * - Convert engine-agnostic SimJoint → Rapier joint
 * - Apply motor commands (D-3.5)
 * - Be fully reset-safe and deterministic
 *
 * ❗ No React
 * ❗ No @react-three/rapier hooks
 * ❗ No implicit lifecycle
 */
export class JointPhysicsEngine {
  private world: any;
  private rapier: any;

  /**
   * Map<jointId, rapierJointHandle>
   * Used for deterministic destroy / reset
   */
  private jointHandles = new Map<string, number>();

  /* ============================
   * D-3.5 — MOTOR REGISTRY
   * ============================ */

  private motors = new Map<string, MotorSpec>();

  constructor(world: any, rapier: any) {
    this.world = world;
    this.rapier = rapier;
  }

  /* ============================================================
   * CREATE JOINT
   * ============================================================
   */

  createJoint(
    joint: SimJoint,
    parentBody: any,
    childBody: any
  ) {
    if (!parentBody || !childBody) return;

    if (this.jointHandles.has(joint.id)) return;

    switch (joint.type) {
      case "fixed": {
        const parentAnchor = new this.rapier.Vector3(
          joint.parentAnchor.x,
          joint.parentAnchor.y,
          joint.parentAnchor.z
        );

        const childAnchor = new this.rapier.Vector3(
          joint.childAnchor.x,
          joint.childAnchor.y,
          joint.childAnchor.z
        );

        const params = this.rapier.JointData.fixed(
          parentAnchor,
          childAnchor
        );

        const handle = this.world.createImpulseJoint(
          params,
          parentBody,
          childBody,
          true
        );

        this.jointHandles.set(joint.id, handle);
        break;
      }

      default:
        break;
    }
  }

  /* ============================================================
   * D-3.5 — REGISTER MOTOR
   * ============================================================
   */

  registerMotor(motor: MotorSpec) {
    this.motors.set(motor.jointId, motor);
  }

  /* ============================================================
   * D-3.5 — APPLY MOTION COMMAND
   * ============================================================
   */

  applyMotionCommand(cmd: MotionCommand) {
    const motor = this.motors.get(cmd.jointId);
    const handle = this.jointHandles.get(cmd.jointId);

    if (!motor || handle === undefined) return;

    const joint = this.world.getImpulseJoint(handle);
    if (!joint) return;

    // Clamp target to motor limits
    const clampedTarget = Math.max(
      motor.limits.min,
      Math.min(motor.limits.max, cmd.target)
    );

    // Revolute & prismatic motors handled explicitly
    switch (motor.type) {
      case "revolute": {
        if (cmd.mode === "position") {
          joint.configureMotorPosition(
            clampedTarget,
            motor.maxForce
          );
        } else {
          joint.configureMotorVelocity(
            clampedTarget,
            motor.maxForce
          );
        }
        break;
      }

      case "prismatic": {
        if (cmd.mode === "position") {
          joint.configureMotorPosition(
            clampedTarget,
            motor.maxForce
          );
        } else {
          joint.configureMotorVelocity(
            clampedTarget,
            motor.maxForce
          );
        }
        break;
      }
    }
  }

  /* ============================================================
   * DESTROY JOINT
   * ============================================================
   */

  destroyJoint(jointId: string) {
    const handle = this.jointHandles.get(jointId);
    if (handle === undefined) return;

    this.world.removeImpulseJoint(handle, true);
    this.jointHandles.delete(jointId);
  }

  /* ============================================================
   * RESET (DESTROY ALL JOINTS + MOTORS)
   * ============================================================
   */

  reset() {
    for (const handle of this.jointHandles.values()) {
      this.world.removeImpulseJoint(handle, true);
    }

    this.jointHandles.clear();
    this.motors.clear();
  }
}
