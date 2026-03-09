// core/validation/assemblyDiagnostics.ts

import type { AssemblyState } from "../assemblyTypes";

export type AssemblyDiagnostic = {
  level: "info" | "warning" | "error";
  code: string;
  message: string;
};

/* =========================================================
   Assembly-Level Diagnostics (Read-Only)
   Pure function — no mutation.
   ========================================================= */

export function diagnoseAssembly(
  state: AssemblyState
): AssemblyDiagnostic[] {
  const diagnostics: AssemblyDiagnostic[] = [];

  const nodeMap = state.nodes;
  const nodes = Object.values(nodeMap);
  const nodeIds = Object.keys(nodeMap);

  /* =========================================================
     Rule 1 — No Actuators Present
     ========================================================= */

  const hasActuator = nodes.some(
    (n) => n.category === "actuator"
  );

  if (!hasActuator) {
    diagnostics.push({
      level: "warning",
      code: "NO_ACTUATORS",
      message: "No actuators added yet",
    });
  }

  /* =========================================================
     Rule 2 — No Power System Present
     ========================================================= */

  const hasPower = nodes.some(
    (n) => n.category === "power"
  );

  if (!hasPower) {
    diagnostics.push({
      level: "warning",
      code: "NO_POWER_SOURCE",
      message: "No power source added yet",
    });
  }

  /* =========================================================
     Rule 3 — Empty Assembly (Only Root)
     ========================================================= */

  if (nodes.length <= 1) {
    diagnostics.push({
      level: "warning",
      code: "EMPTY_ASSEMBLY",
      message: "Assembly contains no attached parts",
    });
  }

  /* =========================================================
     Rule 4 — Orphan Node Detection (LEGACY — SUPERSEDED)
     Preserved for architectural traceability.
     Replaced by formal structural integrity validation below.
     ========================================================= */

  /*
  const rootId = state.rootId;

  const visited = new Set<string>();

  function dfs(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const node = state.nodes[id];
    node.children.forEach(dfs);
  }

  dfs(rootId);

  if (visited.size !== nodes.length) {
    diagnostics.push({
      level: "error",
      code: "ORPHAN_NODE",
      message: "One or more nodes are disconnected from root",
    });
  }
  */

  /* =========================================================
     Rule 5 — Structural Tree Integrity (Authoritative)
     Enforces:
     - Root existence
     - Exactly one root
     - Root has no parent
     - Parent existence
     - Parent/child symmetry
     - No structural cycles
     - Full reachability
     ========================================================= */

  if (nodeIds.length === 0) {
    diagnostics.push({
      level: "error",
      code: "NO_NODES",
      message: "Assembly contains no nodes",
    });
    return diagnostics;
  }

  const root = nodeMap[state.rootId];

  /* -------------------------
     Root existence
     ------------------------- */

  if (!root) {
    diagnostics.push({
      level: "error",
      code: "ROOT_MISSING",
      message: "Declared rootId does not exist in nodes",
    });
    return diagnostics;
  }

  /* -------------------------
     Root must not have parent
     ------------------------- */

  if (root.parentId !== null) {
    diagnostics.push({
      level: "error",
      code: "ROOT_HAS_PARENT",
      message: "Root node must not have a parent",
    });
  }

  /* -------------------------
     Exactly one root
     ------------------------- */

  const rootCandidates = nodeIds.filter(
    (id) => nodeMap[id].parentId === null
  );

  if (rootCandidates.length !== 1) {
    diagnostics.push({
      level: "error",
      code: "INVALID_ROOT_COUNT",
      message:
        "Assembly must contain exactly one root node",
    });
  }

  /* -------------------------
     Parent existence + symmetry
     ------------------------- */

  for (const id of nodeIds) {
    const node = nodeMap[id];

    if (node.parentId !== null) {
      const parent = nodeMap[node.parentId];

      if (!parent) {
        diagnostics.push({
          level: "error",
          code: "INVALID_PARENT_REFERENCE",
          message: `Node "${node.name}" references a non-existent parent`,
        });
        continue;
      }

      if (!parent.children.includes(id)) {
        diagnostics.push({
          level: "error",
          code: "PARENT_CHILD_MISMATCH",
          message: `Parent-child mismatch for node "${node.name}"`,
        });
      }
    }

    for (const childId of node.children) {
      const child = nodeMap[childId];

      if (!child) {
        diagnostics.push({
          level: "error",
          code: "INVALID_CHILD_REFERENCE",
          message: `Node "${node.name}" references a non-existent child`,
        });
        continue;
      }

      if (child.parentId !== id) {
        diagnostics.push({
          level: "error",
          code: "CHILD_PARENT_MISMATCH",
          message: `Child-parent mismatch for node "${child.name}"`,
        });
      }
    }
  }

  /* -------------------------
     Cycle detection + reachability
     ------------------------- */

  const visited = new Set<string>();
  const stack = new Set<string>();
  let cycleDetected = false;

  function dfs(id: string) {
    if (stack.has(id)) {
      cycleDetected = true;
      return;
    }

    if (visited.has(id)) return;

    stack.add(id);
    visited.add(id);

    const node = nodeMap[id];
    for (const childId of node.children) {
      dfs(childId);
    }

    stack.delete(id);
  }

  dfs(state.rootId);

  if (cycleDetected) {
    diagnostics.push({
      level: "error",
      code: "STRUCTURAL_CYCLE",
      message:
        "Assembly contains a structural cycle in parent-child hierarchy",
    });
  }

  if (visited.size !== nodeIds.length) {
    diagnostics.push({
      level: "error",
      code: "DISCONNECTED_NODE",
      message:
        "One or more nodes are disconnected from root",
    });
  }

  return diagnostics;
}