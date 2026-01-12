// store/assemblyStore.tsx
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
} from "../core/assemblyTypes";

import { uid } from "../core/uid";

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
      category: AssemblyNode["category"];
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
  // 🔑 NEW — design-time joint storage (NO behavior)
  | {
      type: "ADD_JOINT";
      joint: AssemblyJoint;
    };

/* =========================================================
   Initial Assembly State
   ========================================================= */

function createInitialState(): AssemblyState {
  const rootId = uid("root");

  const rootNode: AssemblyNode = {
    id: rootId,
    name: "Base",
    partId: "mm-str-base-link",
    category: "structure",
    parentId: null,
    children: [],
    transform: {
      pos: [0, 0, 0],
      rot: [0, 0, 0],
    },
  };

  return {
    robotType: "generic",
    rootId,
    nodes: { [rootId]: rootNode },

    // 🔑 Design-time joint storage (empty by default)
    joints: {},

    selectedNodeId: rootId,
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
      return { ...state, selectedNodeId: action.nodeId };

    case "ADD_PART": {
      const parentId = state.selectedNodeId ?? state.rootId;
      const parent = state.nodes[parentId];
      if (!parent) return state;

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

    // 🔑 NEW — ADD_JOINT (design-time only)
    case "ADD_JOINT": {
      const joint = action.joint;

      return {
        ...state,
        joints: {
          ...state.joints,
          [joint.id]: joint,
        },
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
