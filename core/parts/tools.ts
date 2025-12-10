// core/parts/tools.ts

import type { MMPart } from "./types";

export const TOOL_PARTS: MMPart[] = [
  {
    id: "mm-tool-gripper-2f",
    name: "Parallel 2-Finger Gripper",
    code: "TOL-GRP-2F",
    category: "tool",
    subtype: "gripper-parallel",
    tier: "standard",
    massKg: 0.35,
    sizeM: { x: 0.09, y: 0.07, z: 0.06 },
    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: 24,
    maxCurrentA: 1.2,
    powerW: 28.8,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["manipulator", "humanoid"],
    description: "Electric parallel gripper suitable for pick-and-place tasks.",
  },
];
