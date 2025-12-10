// core/parts/index.ts

import type { MMPart } from "./types";
import { STRUCTURE_PARTS } from "./structure";
import { JOINT_PARTS } from "./joints";
import { ACTUATOR_PARTS } from "./actuators";
import { SENSOR_PARTS } from "./sensors";
import { CONTROL_PARTS } from "./control";
import { POWER_PARTS } from "./power";
import { TOOL_PARTS } from "./tools";
import { CUSTOM_PARTS } from "./custom";
import { VEHICLE_PARTS } from "./vehicle";

// Re-export types & category-specific arrays
export * from "./types";
export {
  STRUCTURE_PARTS,
  JOINT_PARTS,
  ACTUATOR_PARTS,
  SENSOR_PARTS,
  CONTROL_PARTS,
  POWER_PARTS,
  TOOL_PARTS,
  CUSTOM_PARTS,
  VEHICLE_PARTS,
};

// Unified big parts library
export const BASE_PARTS: MMPart[] = [
  ...STRUCTURE_PARTS,
  ...JOINT_PARTS,
  ...ACTUATOR_PARTS,
  ...SENSOR_PARTS,
  ...CONTROL_PARTS,
  ...POWER_PARTS,
  ...TOOL_PARTS,
  ...CUSTOM_PARTS,
  ...VEHICLE_PARTS,
];
