// core/parts/custom.ts

import type { MMPart } from "./types";

export const CUSTOM_PARTS: MMPart[] = [
  {
    id: "mm-cst-box-parametric",
    name: "Custom Parametric Box",
    code: "CST-BOX-PARAM",
    category: "custom",
    subtype: "parametric-box",
    tier: "advanced",
    massKg: null, // computed from material & dimensions later
    sizeM: { x: null, y: null, z: null }, // user defined
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
    compatibleRobots: ["generic"],
    description: "Parametric structural box whose dimensions and mass are defined by the user.",
    notes: "This will be configured via a param editor rather than fixed values.",
  },
];
