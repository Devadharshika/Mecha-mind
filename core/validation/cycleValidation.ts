// core/validation/cycleValidation.ts

import type { AssemblyState, AssemblyJoint } from "../assemblyTypes";

/* =========================================================
   Cycle Detection
   ========================================================= */

/**
 * Returns true if adding the given joint would create a cycle
 * in the assembly graph.
 */
export function wouldCreateCycle(
  state: AssemblyState,
  joint: AssemblyJoint
): boolean {
  const adjacency = buildAdjacency(state, joint);

  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (nodeId === joint.parentId) {
      return true; // cycle detected
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);

    const children = adjacency.get(nodeId) ?? [];
    for (const child of children) {
      if (dfs(child)) return true;
    }

    return false;
  }

  return dfs(joint.childId);
}

/* =========================================================
   Helpers
   ========================================================= */

function buildAdjacency(
  state: AssemblyState,
  newJoint: AssemblyJoint
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  // existing joints
  for (const joint of Object.values(state.joints)) {
    addEdge(map, joint.parentId, joint.childId);
  }

  // proposed joint
  addEdge(map, newJoint.parentId, newJoint.childId);

  return map;
}

function addEdge(
  map: Map<string, string[]>,
  from: string,
  to: string
) {
  if (!map.has(from)) {
    map.set(from, []);
  }
  map.get(from)!.push(to);
}
