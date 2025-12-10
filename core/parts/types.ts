// core/parts/types.ts

import type { PartCategory, RobotType } from "../assemblyTypes";

export type PartTier = "standard" | "advanced" | "elite";

export interface DimensionsMeters {
  x: number | null; // length in meters
  y: number | null; // width in meters
  z: number | null; // height in meters
}

export interface MMPart {
  // Identity
  id: string;          // "mm-act-motor-mx220"
  name: string;        // "MagnaDrive MX-220 Brushless Motor"
  code: string;        // "ACT-MTR-MX220"

  // Classification
  category: PartCategory;
  subtype: string;     // "brushless-motor", "frame-plate", "revolute", ...

  tier: PartTier;      // standard / advanced / elite

  // Physics / sizing
  massKg: number | null;         // kg
  sizeM: DimensionsMeters;       // bounding box in meters

  // Dynamics-related properties (optional depending on category)
  maxTorqueNm?: number | null;   // actuators/joints
  maxSpeedRpm?: number | null;   // motors/rotors
  maxThrustN?: number | null;    // drone/helicopter motors/props
  voltageV?: number | null;
  maxCurrentA?: number | null;
  powerW?: number | null;

  rangeM?: number | null;        // sensors
  updateRateHz?: number | null;  // sensors, controllers

  // Kinematics / joints (for joint parts)
  dof?: number | null;           // 1,2,3...
  jointLimitsRad?: {
    min: number;
    max: number;
  } | null;

  // Compatibility
  compatibleRobots: RobotType[];

  // Human-facing info
  description: string;
  notes?: string;
}
