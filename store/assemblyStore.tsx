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
  RobotType,
} from "../core/assemblyTypes";
import { uid } from "../core/uid";

/**
 * Actions supported by the assembly reducer.
 * Added APPLY_NODE_TRANSFORM so simulation can write transforms via dispatch.
 */
type AssemblyAction =
  | { type: "SET_ROBOT_TYPE"; robotType: RobotType }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "ADD_PART"; partId: string; name: string; category: AssemblyNode["category"] }
  | { type: "RENAME_NODE"; nodeId: string; name: string }
  // apply transform to a node (from simulation or other tools)
  | { type: "APPLY_NODE_TRANSFORM"; nodeId: string; transform: { pos: [number, number, number]; rot?: [number, number, number] } };

/** Create an initial assembly state with a single root node. */
function createInitialState(): AssemblyState {
  const rootId = uid("root");
  const rootNode: AssemblyNode = {
    id: rootId,
    name: "New Robot",
    partId: null,
    category: "root",
    parentId: null,
    children: [],
    // transform is optional; we do not set it here by default
  };

  return {
    robotType: "generic",
    rootId,
    nodes: { [rootId]: rootNode },
    selectedNodeId: rootId,
  };
}

/** Reducer implementing basic assembly operations + transform application. */
function assemblyReducer(state: AssemblyState, action: AssemblyAction): AssemblyState {
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
          [action.nodeId]: { ...node, name: action.name },
        },
      };
    }

    case "APPLY_NODE_TRANSFORM": {
  const node = state.nodes[action.nodeId];
  if (!node) return state;

  // prefer the action's rot, otherwise fall back to existing node transform rot or default
  const newRot = action.transform.rot ?? node.transform?.rot ?? ([0, 0, 0] as [number, number, number]);

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [action.nodeId]: {
        ...node,
        transform: {
          pos: action.transform.pos,
          rot: newRot,
        },
      },
    },
  };
}


    default:
      return state;
  }
}

/** Context wiring types */
interface AssemblyContextValue {
  state: AssemblyState;
  dispatch: Dispatch<AssemblyAction>;
}

const AssemblyContext = createContext<AssemblyContextValue | undefined>(undefined);

/** Provider to wrap app (use at top level where appropriate) */
export function AssemblyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assemblyReducer, undefined, createInitialState);
  return (
    <AssemblyContext.Provider value={{ state, dispatch }}>
      {children}
    </AssemblyContext.Provider>
  );
}

/** Hook consumers should call to access assembly state + dispatch */
export function useAssembly() {
  const ctx = useContext(AssemblyContext);
  if (!ctx) {
    throw new Error("useAssembly must be used inside <AssemblyProvider>");
  }
  return ctx;
}
