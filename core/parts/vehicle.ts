// core/parts/vehicle.ts

import type { MMPart } from "./types";

export const VEHICLE_PARTS: MMPart[] = [
  {
    id: "mm-veh-diff-drive-kit",
    name: "Differential Drive Kit",
    code: "VEH-DIFF-KIT",
    category: "vehicle",
    subtype: "differential-drive",
    tier: "standard",
    massKg: 2.1,
    sizeM: { x: 0.35, y: 0.3, z: 0.12 },
    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: 12,
    maxCurrentA: 8,
    powerW: 96,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["rover"],
    description: "Preconfigured differential drive base with motors, wheels, and encoders.",
  },
];
