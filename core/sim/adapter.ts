// core/sim/adapter.ts
import type { SimEntity, SimJoint } from "./simState";
import type { AssemblyNode } from "../assemblyTypes";
import { BASE_PARTS_MAP } from "../parts/index";
import type { MMPart } from "../parts/types";

/**
 * Convert assembly nodes -> SimEntity[]
 * If AssemblyNode.transform is missing we default to zeros.
 */
export function assemblyNodesToSimEntities(nodes: Record<string, AssemblyNode>): SimEntity[] {
  return Object.values(nodes).map((n) => {
    const partId = n.partId ?? null;
    const part: MMPart | undefined = partId ? BASE_PARTS_MAP[partId] : undefined;

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
        parentId: n.parentId ?? null,
        dimensions: part?.sizeM ?? null,
      },
    } as SimEntity;
  });
}

/**
 * Convert assembly joints -> SimJoint[]
 * This expects your assembly store to have joints array/record with the fields:
 * { id, type, parentId, childId, axis?, limits? }
 * If your joints live elsewhere, adapt the caller.
 */
export function assemblyJointsToSimJoints(joints: any[] = []): SimJoint[] {
  return (joints || []).map((j) => ({
    id: j.id,
    type: (j.type as SimJoint["type"]) ?? "fixed",
    parentId: j.parentId,
    childId: j.childId,
    axis: j.axis ?? undefined,
    limits: j.limits ?? undefined,
    meta: j.meta ?? {},
  }));
}
