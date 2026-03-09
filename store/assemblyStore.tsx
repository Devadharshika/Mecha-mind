"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

import type {
  AssemblyState,
  AssemblyNode,
  AssemblyJoint,
  RobotType,
  PartCategory,
} from "../core/assemblyTypes";

import { createRoverV1Assembly } from "../core/assemblies/rover_v1";
import { uid } from "../core/uid";
import { canAttach } from "../core/validation/attachmentRules";
import { validateJoint } from "../core/validation/jointValidation";

/* =========================================================
   Actions supported by the assembly reducer
   ========================================================= */

type AssemblyAction =
  | { type: "SET_ROBOT_TYPE"; robotType: RobotType }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | {
      type: "ADD_PART";
      partId: string;
      name: string;
      category: PartCategory;
    }
  | { type: "RENAME_NODE"; nodeId: string; name: string }
  | {
      type: "APPLY_NODE_TRANSFORM";
      nodeId: string;
      transform: {
        pos: [number, number, number];
        rot?: [number, number, number];
      };
    }
  | {
      type: "ADD_JOINT";
      joint: AssemblyJoint;
    }
  /* ---------------------------------------------------------
     NEW — Explicit Joint Removal (annotation only)
     --------------------------------------------------------- */
  | {
      type: "REMOVE_JOINT";
      jointId: string;
    }
  /* ---------------------------------------------------------
     NEW — Deterministic subtree removal
     --------------------------------------------------------- */
  | { type: "REMOVE_NODE"; nodeId: string };

/* =========================================================
   Initial Assembly State
   ========================================================= */

/*
   OLD initializer preserved for future generic reset support.
   Not deleted intentionally.

function createInitialState(): AssemblyState {
  ...
}
*/

function createInitialState(): AssemblyState {
  const base = createRoverV1Assembly();

  return {
    ...base,
    validationMessage: null,
  };
}

/* =========================================================
   Assembly Reducer
   ========================================================= */

function assemblyReducer(
  state: AssemblyState,
  action: AssemblyAction
): AssemblyState {
  switch (action.type) {
    case "SET_ROBOT_TYPE":
      return { ...state, robotType: action.robotType };

    case "SELECT_NODE":
      return {
        ...state,
        selectedNodeId: action.nodeId,
        validationMessage: null,
      };

    case "ADD_PART": {
      const parentId = state.selectedNodeId ?? state.rootId;
      const parent = state.nodes[parentId];
      if (!parent) return state;

      const parentCategory =
        parent.category === "root"
          ? "root"
          : parent.category;

      const allowed = canAttach(
        parentCategory,
        action.category
      );

      if (!allowed) {
        return {
          ...state,
          validationMessage: `Cannot attach ${action.category} to ${parent.category}`,
        };
      }

      const id = uid("node");

      const newNode: AssemblyNode = {
        id,
        name: action.name,
        partId: action.partId,
        category: action.category,
        parentId,
        children: [],
      };

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [id]: newNode,
          [parentId]: {
            ...parent,
            children: [...parent.children, id],
          },
        },
        selectedNodeId: id,
        validationMessage: null,
      };
    }

    case "RENAME_NODE": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            name: action.name,
          },
        },
      };
    }

    case "APPLY_NODE_TRANSFORM": {
      const node = state.nodes[action.nodeId];
      if (!node) return state;

      const rot =
        action.transform.rot ??
        node.transform?.rot ??
        ([0, 0, 0] as [number, number, number]);

      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            ...node,
            transform: {
              pos: action.transform.pos,
              rot,
            },
          },
        },
      };
    }

    case "ADD_JOINT": {
      const result = validateJoint(state, action.joint);

      if (!result.ok) {
        return {
          ...state,
          validationMessage: result.reason,
        };
      }

      return {
        ...state,
        joints: {
          ...state.joints,
          [action.joint.id]: action.joint,
        },
        validationMessage: null,
      };
    }

    /* =========================================================
       REMOVE_JOINT — Pure annotation deletion
       Does NOT modify structure.
       ========================================================= */

    case "REMOVE_JOINT": {
      const jointId = action.jointId;

      if (!state.joints[jointId]) {
        return state;
      }

      const newJoints = { ...state.joints };
      delete newJoints[jointId];

      return {
        ...state,
        joints: newJoints,
        validationMessage: null,
      };
    }

    /* =========================================================
       REMOVE_NODE — Deterministic Subtree Deletion
       ========================================================= */

    case "REMOVE_NODE": {
      const targetId = action.nodeId;

      if (targetId === state.rootId) {
        return {
          ...state,
          validationMessage:
            "Root node cannot be removed. Start a new assembly instead.",
        };
      }

      const targetNode = state.nodes[targetId];
      if (!targetNode) return state;

      const removedIds = new Set<string>();

      function collect(id: string) {
        if (removedIds.has(id)) return;
        removedIds.add(id);

        const node = state.nodes[id];
        if (!node) return;

        for (const childId of node.children) {
          collect(childId);
        }
      }

      collect(targetId);

      const newNodes: typeof state.nodes = {};

      for (const [id, node] of Object.entries(state.nodes)) {
        if (!removedIds.has(id)) {
          newNodes[id] = { ...node };
        }
      }

      const parentId = targetNode.parentId;
      if (parentId && newNodes[parentId]) {
        newNodes[parentId] = {
          ...newNodes[parentId],
          children: newNodes[parentId].children.filter(
            (id) => id !== targetId
          ),
        };
      }

      const newJoints: typeof state.joints = {};

      for (const [id, joint] of Object.entries(state.joints)) {
        if (
          !removedIds.has(joint.parentId) &&
          !removedIds.has(joint.childId)
        ) {
          newJoints[id] = joint;
        }
      }

      const newSelected =
        state.selectedNodeId &&
        removedIds.has(state.selectedNodeId)
          ? state.rootId
          : state.selectedNodeId;

      return {
        ...state,
        nodes: newNodes,
        joints: newJoints,
        selectedNodeId: newSelected,
        validationMessage: null,
      };
    }

    default:
      return state;
  }
}

/* =========================================================
   Context Wiring
   ========================================================= */

interface AssemblyContextValue {
  state: AssemblyState;
  dispatch: Dispatch<AssemblyAction>;
}

const AssemblyContext = createContext<AssemblyContextValue | undefined>(
  undefined
);

export function AssemblyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    assemblyReducer,
    undefined,
    createInitialState
  );

  return (
    <AssemblyContext.Provider value={{ state, dispatch }}>
      {children}
    </AssemblyContext.Provider>
  );
}

export function useAssembly() {
  const ctx = useContext(AssemblyContext);
  if (!ctx) {
    throw new Error("useAssembly must be used inside <AssemblyProvider>");
  }
  return ctx;
}