// core/assemblyTypes.ts

// Supported robot families in MechaMind
export type RobotType =
  | "generic"
  | "drone"
  | "humanoid"
  | "rover"
  | "manipulator"
  | "exosuit";

// Core + advanced part categories for MechaMind
export type PartCategory =
  | "structure"
  | "joint"
  | "actuator"
  | "sensor"
  | "control"
  | "power"
  | "tool" // Tools & end effectors
  | "custom" // Custom / parametric parts
  | "vehicle"; // Vehicle modules (drive kits, tracks, etc.)

// Basic part reference used inside the assembly
export interface PartRef {
  id: string; // part id from the library
}

// Single node in the assembly tree
export interface AssemblyNode {
  id: string;
  name: string;
  partId: string | null; // null for root / empty nodes
  category: PartCategory | "root";
  parentId: string | null;
  children: string[]; // child node ids
}

// State shape for the assembly workspace
export interface AssemblyState {
  robotType: RobotType;
  rootId: string;
  nodes: Record<string, AssemblyNode>;
  selectedNodeId: string | null;
}
