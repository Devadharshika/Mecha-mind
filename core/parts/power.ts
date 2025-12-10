// core/parts/power.ts

import type { MMPart } from "./types";

export const POWER_PARTS: MMPart[] = [
  {
    id: "mm-pwr-lipo-4s-4500",
    name: "LiPo 4S 4500mAh Pack",
    code: "PWR-LIPO-4S-4500",
    category: "power",
    subtype: "battery-lipo",
    tier: "standard",
    massKg: 0.42,
    sizeM: { x: 0.14, y: 0.045, z: 0.035 },
    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: 14.8,
    maxCurrentA: 90, // e.g. 20C discharge
    powerW: null,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["drone", "rover", "generic"],
    description: "High-discharge LiPo battery pack suitable for mid-sized drones and rovers.",
  },
];
