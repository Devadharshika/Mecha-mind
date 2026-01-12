// core/parts/structure.ts

import type { MMPart } from "./types";

export const STRUCTURE_PARTS: MMPart[] = [
  {
    id: "mm-str-frame-quad-x450",
    name: "Quadcopter Frame X-450",
    code: "STR-FRAME-X450",
    category: "structure",
    subtype: "drone-frame",
    tier: "standard",
    massKg: 0.35,
    sizeM: { x: 0.45, y: 0.45, z: 0.04 },
    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: null,
    maxCurrentA: null,
    powerW: null,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["drone"],
    description: "Carbon-fiber quadcopter frame suitable for mid-sized multirotors.",
  },
  {
    id: "mm-str-humanoid-torso-lite",
    name: "Humanoid Torso Frame Lite",
    code: "STR-TORSO-LITE",
    category: "structure",
    subtype: "humanoid-torso",
    tier: "advanced",
    massKg: 3.2,
    sizeM: { x: 0.35, y: 0.22, z: 0.5 },
    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: null,
    maxCurrentA: null,
    powerW: null,
    rangeM: null,
    updateRateHz: null,
    dof: null,
    jointLimitsRad: null,
    compatibleRobots: ["humanoid"],
    description:
      "Lightweight torso frame for mid-size humanoid robots with modular mount points.",
  },

  // ------------------------------------------------------------------
  // Generic Base Link (safe root for any robot assembly)
  // ------------------------------------------------------------------
  {
    id: "mm-str-base-link",
    name: "Base Link",
    code: "STR-BASE-LINK",
    category: "structure",
    subtype: "base-link",
    tier: "standard",
    massKg: 5.0,
    sizeM: { x: 0.3, y: 0.1, z: 0.3 },

    maxTorqueNm: null,
    maxSpeedRpm: null,
    maxThrustN: null,
    voltageV: null,
    maxCurrentA: null,
    powerW: null,
    rangeM: null,
    updateRateHz: null,

    dof: null,
    jointLimitsRad: null,

    compatibleRobots: [
      "generic",
      "drone",
      "humanoid",
      "rover",
      "manipulator",
      "exosuit",
    ],
    description:
      "Generic base structural link used as the root body for robot assemblies.",
  },
];
