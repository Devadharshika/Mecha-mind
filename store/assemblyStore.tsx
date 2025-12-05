// store/assemblyStore.ts
"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import type { AssemblyState, AssemblyNode, RobotType } from "../core/assemblyTypes";
import { uid } from "../core/uid";

type AssemblyAction =
  | { type: "SET_ROBOT_TYPE"; robotType: RobotType }
  | { type: "SELECT_NODE"; nodeId: string | null }
  | { type: "ADD_PART"; partId: string; name: string; category: AssemblyNode["category"] }
  | { type: "RENAME_NODE"; nodeId: string; name: string };

function createInitialState(): AssemblyState {
  const rootId = uid("root");
  const rootNode: AssemblyNode = {
    id: rootId,
    name: "New Robot",
    partId: null,
    category: "root",
    parentId: null,
    children: [],
  };

  return {
    robotType: "generic",
    rootId,
    nodes: { [rootId]: rootNode },
    selectedNodeId: rootId,
  };
}

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

    default:
      return state;
  }
}

// Context wiring
interface AssemblyContextValue {
  state: AssemblyState;
  dispatch: Dispatch<AssemblyAction>;
}

const AssemblyContext = createContext<AssemblyContextValue | undefined>(undefined);

export function AssemblyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assemblyReducer, undefined, createInitialState);
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
