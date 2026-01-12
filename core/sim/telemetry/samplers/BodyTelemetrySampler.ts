// core/sim/telemetry/samplers/BodyTelemetrySampler.ts

import type {
  BodyTelemetrySample,
  TelemetryAvailability,
  TelemetryTime,
  Vec3,
  Quaternion,
} from "../telemetryTypes";

/**
 * Phase D-4.2 — Body Telemetry Sampler
 *
 * Read-only sampler that extracts rigid-body state from the physics engine
 * and converts it into a BodyTelemetrySample.
 *
 * ❌ No writes to physics
 * ❌ No control logic
 * ❌ No caching
 * ❌ No time ownership
 *
 * ✅ Stateless
 * ✅ Deterministic
 * ✅ Reset-safe
 * ✅ World-frame only
 */
export class BodyTelemetrySampler {
  /**
   * Physics world reference (read-only).
   * Typed as `any` to remain engine-agnostic.
   */
  private readonly world: any;

  constructor(world: any) {
    this.world = world;
  }

  /**
   * Sample telemetry for a single rigid body.
   *
   * @param bodyId Stable simulation body identifier
   * @param time Canonical simulation time reference
   */
  sampleBody(
    bodyId: string,
    time: TelemetryTime
  ): BodyTelemetrySample {
    const body = this.getPhysicsBody(bodyId);

    // Body not present (e.g., reset, teardown, not yet spawned)
    if (!body) {
      return {
        bodyId,
        time,
        availability: "temporarily-unavailable",
      };
    }

    let availability: TelemetryAvailability = "available";

    let position: Vec3 | undefined;
    let orientation: Quaternion | undefined;
    let linearVelocity: Vec3 | undefined;
    let angularVelocity: Vec3 | undefined;

    try {
      /**
       * IMPORTANT:
       * These property accesses are intentionally generic.
       * Concrete engines (Rapier, etc.) must expose equivalent
       * read-only getters when integrated.
       */

      if (body.translation) {
        const t = body.translation();
        position = { x: t.x, y: t.y, z: t.z };
      }

      if (body.rotation) {
        const r = body.rotation();
        orientation = { x: r.x, y: r.y, z: r.z, w: r.w };
      }

      if (body.linvel) {
        const v = body.linvel();
        linearVelocity = { x: v.x, y: v.y, z: v.z };
      }

      if (body.angvel) {
        const w = body.angvel();
        angularVelocity = { x: w.x, y: w.y, z: w.z };
      }
    } catch {
      availability = "unsupported";
    }

    // If nothing could be read, make that explicit
    if (
      position === undefined &&
      orientation === undefined &&
      linearVelocity === undefined &&
      angularVelocity === undefined
    ) {
      availability = "unsupported";
    }

    return {
      bodyId,
      time,
      availability,
      position,
      orientation,
      linearVelocity,
      angularVelocity,
    };
  }

  /* ============================================================
   * INTERNAL HELPERS (READ-ONLY)
   * ============================================================
   */

  /**
   * Resolve a physics body handle by simulation bodyId.
   * Must return undefined if body is not available.
   */
  private getPhysicsBody(bodyId: string): any | undefined {
    // Assumes the physics world exposes a rigid-body lookup.
    // This function MUST NOT create or mutate bodies.

    if (!this.world || typeof this.world.getRigidBody !== "function") {
      return undefined;
    }

    try {
      return this.world.getRigidBody(bodyId);
    } catch {
      return undefined;
    }
  }
}
