// core/compiler/compileAssembly.ts

import type { AssemblyState } from "../assemblyTypes";
import type {
  CompileResult,
  CompiledSimulationSpec,
  SimBodySpec,
  SimJointSpec,
} from "./types";

import { STRUCTURE_PARTS } from "../parts/structure";

/* ============================================================
   Constants
============================================================ */

const IDENTITY_QUAT: [number, number, number, number] = [0, 0, 0, 1];

const JOINT_TYPE_MAP = {
  fixed: "FIXED",
  revolute: "REVOLUTE",
  prismatic: "PRISMATIC",
} as const;

/* ============================================================
   Stable JSON Stringify (Deterministic Key Ordering)
============================================================ */

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(",")}]`;
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();

  return `{${keys
    .map(key => `"${key}":${stableStringify((obj as any)[key])}`)
    .join(",")}}`;
}

/* ============================================================
   SHA-256 (Node + Browser Compatible)
============================================================ */

async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const { createHash } = await import("crypto");
  return createHash("sha256").update(message).digest("hex");
}

/* ============================================================
   Part Lookup
============================================================ */

function findStructurePart(partId: string) {
  return STRUCTURE_PARTS.find(p => p.id === partId) || null;
}

/* ============================================================
   Quaternion Utilities
============================================================ */

function eulerToQuaternion(
  [x, y, z]: [number, number, number]
): [number, number, number, number] {
  const cx = Math.cos(x / 2);
  const sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2);
  const sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2);
  const sz = Math.sin(z / 2);

  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
}

function multiplyQuat(
  a: [number, number, number, number],
  b: [number, number, number, number]
): [number, number, number, number] {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;

  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

function rotateVector(
  v: [number, number, number],
  q: [number, number, number, number]
): [number, number, number] {
  const [x, y, z] = v;
  const [qx, qy, qz, qw] = q;

  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;

  return [
    ix * qw + iw * -qx + iy * -qz - iz * -qy,
    iy * qw + iw * -qy + iz * -qx - ix * -qz,
    iz * qw + iw * -qz + ix * -qy - iy * -qx,
  ];
}

/* ============================================================
   Inertia Calculation
============================================================ */

function computeBoxInertia(
  mass: number,
  size: { x: number; y: number; z: number }
): [number, number, number] {
  const { x, y, z } = size;

  const ix = (1 / 12) * mass * (y * y + z * z);
  const iy = (1 / 12) * mass * (x * x + z * z);
  const iz = (1 / 12) * mass * (x * x + y * y);

  return [ix, iy, iz];
}

/* ============================================================
   Axis Normalization
============================================================ */

function normalizeAxis(
  axis: [number, number, number]
): [number, number, number] {
  const [x, y, z] = axis;
  const length = Math.sqrt(x * x + y * y + z * z);

  if (length === 0) {
    return [0, 0, 1];
  }

  return [x / length, y / length, z / length];
}

/* ============================================================
   Compiler
============================================================ */

export async function compileAssembly(
  assembly: AssemblyState
): Promise<CompileResult> {

  if (!assembly.rootId || !assembly.nodes[assembly.rootId]) {
    return {
      success: false,
      errors: [
        {
          code: "MISSING_ROOT",
          message: "Assembly root node is missing or invalid.",
        },
      ],
    };
  }

  /* ----------------------------------------------------------
     World Transform Resolution
  ---------------------------------------------------------- */

  const worldTransforms: Record<
    string,
    { pos: [number, number, number]; rot: [number, number, number, number]; }
  > = {};

  const rootNode = assembly.nodes[assembly.rootId];

  const rootLocalPos = rootNode.transform?.pos ?? [0, 0, 0];
  const rootLocalRot = rootNode.transform?.rot
    ? eulerToQuaternion(rootNode.transform.rot)
    : IDENTITY_QUAT;

  worldTransforms[rootNode.id] = {
    pos: rootLocalPos,
    rot: rootLocalRot,
  };

  function traverse(nodeId: string) {
    const node = assembly.nodes[nodeId];
    const parentWorld = worldTransforms[nodeId];

    const sortedChildren = [...node.children].sort();

    for (const childId of sortedChildren) {
      const child = assembly.nodes[childId];

      const localPos = child.transform?.pos ?? [0, 0, 0];
      const localRot = child.transform?.rot
        ? eulerToQuaternion(child.transform.rot)
        : IDENTITY_QUAT;

      const worldRot = multiplyQuat(parentWorld.rot, localRot);
      const rotatedLocalPos = rotateVector(localPos, parentWorld.rot);

      const worldPos: [number, number, number] = [
        parentWorld.pos[0] + rotatedLocalPos[0],
        parentWorld.pos[1] + rotatedLocalPos[1],
        parentWorld.pos[2] + rotatedLocalPos[2],
      ];

      worldTransforms[childId] = {
        pos: worldPos,
        rot: worldRot,
      };

      traverse(childId);
    }
  }

  traverse(rootNode.id);

  /* ----------------------------------------------------------
     Body Mapping (Runtime Identity Only)
  ---------------------------------------------------------- */

  const bodies: SimBodySpec[] = [];

  const sortedNodes = Object.values(assembly.nodes)
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const node of sortedNodes) {

    if (!node.partId) continue;

    const part = findStructurePart(node.partId);

    if (
      !part ||
      part.massKg == null ||
      part.massKg <= 0 ||
      part.sizeM.x == null ||
      part.sizeM.y == null ||
      part.sizeM.z == null
    ) {
      return {
        success: false,
        errors: [
          {
            code: "INVALID_PART",
            message: `Invalid physical properties for part ${node.partId}`,
            relatedId: node.id,
          },
        ],
      };
    }

    const mass = part.massKg;
    const size = {
      x: part.sizeM.x,
      y: part.sizeM.y,
      z: part.sizeM.z,
    };

    const inertia = computeBoxInertia(mass, size);
    const world = worldTransforms[node.id];

bodies.push({
  runtimeId: `body_${node.id}`,

  mass,
  inertiaTensor: inertia,
  worldPosition: world.pos,
  worldRotation: world.rot,

  size: [size.x, size.y, size.z], // NEW
});
  }

  /* ----------------------------------------------------------
     Joint Mapping
  ---------------------------------------------------------- */

  const joints: SimJointSpec[] = Object.values(assembly.joints)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((joint) => {

      let axis: [number, number, number] | undefined;

      if (joint.type === "revolute" || joint.type === "prismatic") {
        axis = joint.axis
          ? normalizeAxis(joint.axis)
          : [0, 0, 1];
      }

      return {
        runtimeId: `joint_${joint.id}`,

        parentRuntimeId: `body_${joint.parentId}`,
        childRuntimeId: `body_${joint.childId}`,
        type: JOINT_TYPE_MAP[joint.type],
        axis,
        parentAnchor: [0, 0, 0],
        childAnchor: [0, 0, 0],
        limits: joint.limits ?? undefined,
        motorEnabled: false,
      };
    });

  /* ----------------------------------------------------------
     Deterministic Hash
  ---------------------------------------------------------- */

  const hashInput = {
    schemaVersion: "simSpec-1.0",
    compilerVersion: "H7-v2", // Bumped due to size field addition
    bodies,
    joints,
    world: {
      gravity: [0, -9.81, 0] as [number, number, number],
      timeStep: 1 / 60,
      solverIterations: 10,
    },
  };

  const stableJson = stableStringify(hashInput);
  const hash = await sha256(stableJson);

  const spec: CompiledSimulationSpec = {
    schemaVersion: hashInput.schemaVersion,
    compilerVersion: hashInput.compilerVersion,
    hash,
    bodies,
    joints,
    sensors: [],
    world: hashInput.world,
  };

  return {
    success: true,
    errors: [],
    spec,
  };
}