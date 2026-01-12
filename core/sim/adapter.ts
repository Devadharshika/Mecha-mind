// core/sim/adapter.ts

/* ============================================================
 * IMPORTS
 * ============================================================
 */

import type { SimEntity } from "./simState";
import type { AssemblyNode } from "../assemblyTypes";
import { BASE_PARTS_MAP } from "../parts/index";
import type { MMPart } from "../parts/types";
import type { AssemblyJoint } from "../assemblyTypes";


/* ---------------- Phase D-1 TYPES ---------------- */

import type { SimulationSnapshot } from "./types/simSnapshot";
import type { SimRigidBody } from "./types/simBody";
import type { SimJoint } from "./types/simJoint";
import type { SimRobot } from "./types/simRobot";
import type { SimWorld } from "./types/simWorld";
import type { Vec3, Quat } from "./types/math";

/* ============================================================
 * PHASE C — LEGACY ADAPTER (DO NOT DELETE)
 * ============================================================
 * Used by existing simulation / rendering pipeline.
 * Preserved intentionally for rollback, reference, and parity.
 * ============================================================
 */

export function assemblyNodesToSimEntities(
  nodes: Record<string, AssemblyNode>
): SimEntity[] {
  return Object.values(nodes).map((n) => {
    const partId = n.partId ?? null;
    const part: MMPart | undefined = partId
      ? BASE_PARTS_MAP[partId]
      : undefined;

    const pos = (n as any).transform?.pos ?? [0, 0, 0];
    const rot = (n as any).transform?.rot ?? [0, 0, 0];

    return {
      id: n.id,
      type: "part",
      position: pos as [number, number, number],
      rotation: rot as [number, number, number],
      mass: part?.massKg ?? 1,
      meta: {
        partId,
        name: n.name,
        category: n.category,
        dimensions: part?.sizeM ?? null,
      },
    } as SimEntity;
  });
}

/* ============================================================
 * PHASE D-1 — PURE MATH HELPERS (NO THREE / RAPier)
 * ============================================================
 */

/**
 * Convert Euler XYZ (radians) → Quaternion
 * Deterministic, serializable, engine-agnostic
 */
function eulerToQuat(x: number, y: number, z: number): Quat {
  const cx = Math.cos(x / 2);
  const sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2);
  const sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2);
  const sz = Math.sin(z / 2);

  return {
    w: cx * cy * cz + sx * sy * sz,
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz - sx * sy * cz,
  };
}

/* ============================================================
 * PHASE D-1 — ASSEMBLY → SIMULATION SNAPSHOT
 * ============================================================
 * Static structure only:
 * - bodies
 * - fixed joints
 * - no motors
 * - no physics world
 * - no runtime mutation
 * ============================================================
 */

export function createSimulationSnapshotFromAssembly(
  nodes: Record<string, AssemblyNode>
): SimulationSnapshot {
  const bodies: SimRigidBody[] = [];
  const joints: SimJoint[] = [];

  /* ------------------------------------------------------------
   * STEP 2a — Rigid body extraction
   * ------------------------------------------------------------
   */

  for (const node of Object.values(nodes)) {
    const partId = node.partId ?? null;
    const part: MMPart | undefined = partId
      ? BASE_PARTS_MAP[partId]
      : undefined;

    const posArr = node.transform?.pos ?? [0, 0, 0];
    const rotArr = node.transform?.rot ?? [0, 0, 0];

    const position: Vec3 = {
      x: posArr[0],
      y: posArr[1],
      z: posArr[2],
    };

    const rotation: Quat = eulerToQuat(
      rotArr[0],
      rotArr[1],
      rotArr[2]
    );

    bodies.push({
      id: node.id,
      position,
      rotation,
      bodyType: "dynamic",
      mass: part?.massKg ?? 1,
      sourcePartId: partId ?? "unknown",
      label: node.name,

      /* --------------------------------------------------------
       * FUTURE (Phase D-2 / D-3)
       * --------------------------------------------------------
       * inertia: { x, y, z },
       * colliderId,
       * kinematic flags
       * --------------------------------------------------------
       */
    });
  }

  /* ------------------------------------------------------------
   * STEP 2b — Implicit hierarchy → explicit fixed joints
   * ------------------------------------------------------------
   * AssemblyNode.parentId + transform ⇒ FIXED SimJoint
   * ------------------------------------------------------------
   */

  for (const node of Object.values(nodes)) {
    if (!node.parentId) continue;

    const parent = nodes[node.parentId];
    if (!parent) continue;

    const localPos = node.transform?.pos ?? [0, 0, 0];

    joints.push({
      id: `joint-${parent.id}-${node.id}`,
      type: "fixed",

      parentBodyId: parent.id,
      childBodyId: node.id,

      parentAnchor: {
        x: 0,
        y: 0,
        z: 0,
      },

      childAnchor: {
        x: localPos[0],
        y: localPos[1],
        z: localPos[2],
      },

      sourceJointId: node.id,

      /* --------------------------------------------------------
       * FUTURE (Phase D-2 / D-3)
       * --------------------------------------------------------
       * type: "revolute" | "prismatic"
       * axis: { x, y, z }
       * limits: { min, max }
       * motor: { torque, damping, control }
       * --------------------------------------------------------
       */
    });
  }

  /* ------------------------------------------------------------
   * STEP 2c — Robot & world assembly
   * ------------------------------------------------------------
   */

  const rootBodyId =
    Object.values(nodes).find((n) => n.parentId === null)?.id ??
    bodies[0]?.id ??
    "";

  const robot: SimRobot = {
    id: "robot-1",
    bodies,
    joints,
    rootBodyId,
  };

  const world: SimWorld = {
    robots: [robot],

    /* --------------------------------------------------------
     * FUTURE
     * --------------------------------------------------------
     * environment
     * terrain
     * fixtures
     * --------------------------------------------------------
     */
  };

  return {
    world,
    createdAt: Date.now(),
  };
}
/* ============================================================
 * PHASE D-3.2 — JOINT EXTRACTION FOR RUNTIME LIFECYCLE
 * ============================================================
 * This does NOT change snapshot behavior.
 * It allows the simulation runtime to register joints
 * without re-parsing assembly state.
 * ============================================================
 */

export function extractAssemblyJoints(
  nodes: Record<string, AssemblyNode>
): AssemblyJoint[] {
  const joints: AssemblyJoint[] = [];

  for (const node of Object.values(nodes)) {
    if (!node.parentId) continue;

    joints.push({
      id: `joint-${node.parentId}-${node.id}`,
      type: "fixed",
      parentId: node.parentId,
      childId: node.id,
    });
  }

  return joints;
}
