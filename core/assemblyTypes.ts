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

export interface AssemblyNode {
  id: string;
  name: string;
  partId: string | null;
  category: PartCategory | "root";
  parentId: string | null;
  children: string[];

  // optional transform used by simulation and editor
  transform?: {
    pos: [number, number, number];
    rot?: [number, number, number]; // Euler XYZ in radians
  };
}

/* =========================================================
   Assembly Joints — DESIGN-TIME ONLY
   (No physics, no simulation, no execution)
   ========================================================= */

export type JointType =
  | "fixed"
  | "revolute"
  | "prismatic";

export interface AssemblyJoint {
  id: string;

  // relationship
  parentId: string; // parent AssemblyNode id
  childId: string;  // child AssemblyNode id

  // joint semantics
  type: JointType;

  // axis definition (local to parent frame)
  // required for revolute / prismatic joints
  axis?: [number, number, number];

  // optional joint limits (radians or meters)
  limits?: {
    min: number;
    max: number;
  };
}

// State shape for the assembly workspace
export interface AssemblyState {
  robotType: RobotType;
  rootId: string;

  // structural graph
  nodes: Record<string, AssemblyNode>;

  // 🔑 NEW — design-time joint storage
  joints: Record<string, AssemblyJoint>;

  selectedNodeId: string | null;
}
