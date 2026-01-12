// core/sim/telemetry/samplers/JointTelemetrySampler.ts

import type {
  JointTelemetrySample,
  TelemetryAvailability,
  TelemetryTime,
} from "../telemetryTypes";

/**
 * Phase D-4.2 — Joint Telemetry Sampler
 *
 * Read-only sampler that extracts joint state from the physics engine
 * and converts it into a JointTelemetrySample.
 *
 * ❌ No writes to physics
 * ❌ No control logic
 * ❌ No caching
 * ❌ No time ownership
 *
 * ✅ Stateless
 * ✅ Deterministic
 * ✅ Reset-safe
 */
export class JointTelemetrySampler {
  /**
   * Physics world reference (read-only).
   * Typed as `any` to remain engine-agnostic at this layer.
   */
  private readonly world: any;

  constructor(world: any) {
    this.world = world;
  }

  /**
   * Sample telemetry for a single joint.
   *
   * @param jointId Stable simulation joint identifier
   * @param time Canonical simulation time reference
   */
  sampleJoint(
    jointId: string,
    time: TelemetryTime
  ): JointTelemetrySample {
    const joint = this.getPhysicsJoint(jointId);

    // Joint not present (e.g., during reset or teardown)
    if (!joint) {
      return {
        jointId,
        time,
        availability: "temporarily-unavailable",
      };
    }

    let availability: TelemetryAvailability = "available";

    let position: number | undefined;
    let velocity: number | undefined;
    let effort: number | undefined;

    try {
      // NOTE:
      // These accessors are intentionally generic.
      // Concrete physics engines (Rapier, etc.) must
      // expose equivalent read-only getters.

      if (typeof joint.position === "number") {
        position = joint.position;
      }

      if (typeof joint.velocity === "number") {
        velocity = joint.velocity;
      }

      if (typeof joint.effort === "number") {
        effort = joint.effort;
      }
    } catch {
      // Engine present but does not expose joint telemetry
      availability = "unsupported";
    }

    // If nothing could be read, mark explicitly
    if (
      position === undefined &&
      velocity === undefined &&
      effort === undefined
    ) {
      availability = "unsupported";
    }

    return {
      jointId,
      time,
      availability,
      position,
      velocity,
      effort,
    };
  }

  /* ============================================================
   * INTERNAL HELPERS (READ-ONLY)
   * ============================================================
   */

  /**
   * Resolve a physics joint handle by simulation jointId.
   * Must return undefined if joint is not available.
   */
  private getPhysicsJoint(jointId: string): any | undefined {
    // This assumes the physics world exposes a joint registry
    // or lookup mechanism.
    //
    // IMPORTANT:
    // - Read-only access only
    // - No creation
    // - No mutation

    if (!this.world || typeof this.world.getImpulseJoint !== "function") {
      return undefined;
    }

    try {
      return this.world.getImpulseJoint(jointId);
    } catch {
      return undefined;
    }
  }
}
