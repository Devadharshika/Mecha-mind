// core/partCategories.ts

import type { PartCategory } from "./assemblyTypes";

export interface PartCategoryMeta {
  id: PartCategory;
  label: string;
  description: string;
  advanced?: boolean; // for custom/vehicle, etc.
}

export const PART_CATEGORIES: PartCategoryMeta[] = [
  {
    id: "structure",
    label: "Structure",
    description: "Frames, plates, chassis, beams, brackets, mounts – the skeleton of all robots.",
  },
  {
    id: "joint",
    label: "Joints",
    description: "Revolute, prismatic, spherical, and other joints that define the robot’s degrees of freedom.",
  },
  {
    id: "actuator",
    label: "Actuators",
    description: "Motors, servos, linear actuators, rotors, wheels – anything that produces motion.",
  },
  {
    id: "sensor",
    label: "Sensors",
    description: "IMUs, cameras, lidars, encoders, tactile arrays – perception & feedback.",
  },
  {
    id: "control",
    label: "Control",
    description: "Robot controllers, motor drivers, IO & communication modules.",
  },
  {
    id: "power",
    label: "Power",
    description: "Batteries, power distribution, converters, and power management.",
  },
  {
    id: "tool",
    label: "Tools & End Effectors",
    description: "Grippers, hands, welders, screwdrivers, suction cups, and other end effectors.",
  },
  {
    id: "custom",
    label: "Custom / Parametric",
    description: "User-defined and parametric parts: beams, pipes, frames, special geometry.",
    advanced: true,
  },
  {
    id: "vehicle",
    label: "Vehicle Modules",
    description: "Drive kits, tracks, steering modules, suspension, mobile bases.",
    advanced: true,
  },
];
