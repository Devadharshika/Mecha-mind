// core/sim/simState.ts
export type SimTime = number;

export type SimEntity = {
  id: string; // maps to AssemblyNode.id
  type: "part" | "joint" | "sensor";
  position: [number, number, number];
  rotation: [number, number, number]; // Euler XYZ (radians)
  mass?: number;
  meta?: Record<string, any>;
};

export type SimJoint = {
  id: string;
  type: "revolute" | "prismatic" | "fixed" | "ball";
  parentId: string;
  childId: string;
  axis?: [number, number, number];
  limits?: { min: number; max: number };
  meta?: Record<string, any>;
};

export type SimState = {
  resetId: number;
  time: SimTime;
  running: boolean;
  entities: Record<string, SimEntity>;
  joints: Record<string, SimJoint>;
  gravity: [number, number, number];
};

export const createEmptyState = (opts?: Partial<Pick<SimState, "gravity">>): SimState => ({
  time: 0,
  running: false,
  entities: {},
  joints: {},
  gravity: opts?.gravity ?? [0, -9.81, 0],
});
