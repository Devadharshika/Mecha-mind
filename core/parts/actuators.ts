// core/parts/actuators.ts

import type { MMPart } from "./types";

export const ACTUATOR_PARTS: MMPart[] = [
  {
    id: "mm-act-motor-drone-2207",
    name: "AeroDrive 2207 Brushless Motor",
    code: "ACT-MTR-2207",
    category: "actuator",
    subtype: "brushless-motor",
    tier: "standard",
    massKg: 0.032,
    sizeM: { x: 0.027, y: 0.027, z: 0.03 },
    maxTorqueNm: 0.5,
    maxSpeedRpm: 25000,
    maxThrustN: 18, // ~1.8 kgf
    voltageV: 14.8, // 4S LiPo
    maxCurrentA: 35,
    powerW: 500,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["drone"],
    description: "High-RPM brushless motor for freestyle and racing quadcopters.",
  },
  {
    id: "mm-act-servo-mx64-like",
    name: "TitanServo MX-64 Equivalent",
    code: "ACT-SRV-MX64",
    category: "actuator",
    subtype: "robot-servo",
    tier: "advanced",
    massKg: 0.126,
    sizeM: { x: 0.04, y: 0.04, z: 0.05 },
    maxTorqueNm: 6.0,
    maxSpeedRpm: 60,
    maxThrustN: null,
    voltageV: 12,
    maxCurrentA: 3,
    powerW: 36,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["humanoid", "manipulator", "exosuit"],
    description: "Smart servo module suitable for humanoid and manipulator joints.",
  },
];
