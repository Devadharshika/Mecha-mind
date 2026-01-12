// core/sim/joints/bodyRegistry.ts

/**
 * Phase D-3.2
 * Body registry for physics bodies.
 *
 * NOTE:
 * We intentionally avoid importing RigidBodyApi directly
 * to prevent version coupling with @react-three/rapier.
 * Precise typing will be introduced in Phase D-3.3.
 */
export type BodyRegistry = Map<string, unknown>;

export function createBodyRegistry(): BodyRegistry {
  return new Map();
}
