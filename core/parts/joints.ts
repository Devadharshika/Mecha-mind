// core/parts/joints.ts

import type { MMPart } from "./types";

export const JOINT_PARTS: MMPart[] = [
  {
    id: "mm-jnt-revolute-shoulder",
    name: "Revolute Joint – Shoulder",
    code: "JNT-REV-SHD",
    category: "joint",
    subtype: "revolute",
    tier: "advanced",
    massKg: 0.9,
    sizeM: { x: 0.09, y: 0.08, z: 0.08 },
    maxTorqueNm: 120,
    maxSpeedRpm: 45, // about 0.75 rev/s
    maxThrustN: null,
    voltageV: null,
    maxCurrentA: null,
    powerW: null,
    rangeM: null,
    updateRateHz: null,
    dof: 1,
    jointLimitsRad: {
      min: (-120 * Math.PI) / 180,
      max: (120 * Math.PI) / 180,
    },
    compatibleRobots: ["humanoid", "manipulator"],
    description: "High-torque revolute joint suitable for humanoid shoulders and large manipulators.",
  },
];
