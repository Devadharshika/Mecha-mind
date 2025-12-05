// core/partCategories.ts
import type { PartCategory } from "./assemblyTypes";

export interface PartCategoryMeta {
  id: PartCategory;
  label: string;
}

export const PART_CATEGORIES: PartCategoryMeta[] = [
  { id: "structure", label: "Structure" },
  { id: "joint", label: "Joints" },
  { id: "actuator", label: "Actuators" },
  { id: "sensor", label: "Sensors" },
  { id: "control", label: "Control" },
  { id: "power", label: "Power" },
  { id: "tool", label: "Tools" },
  { id: "custom", label: "Custom" },
];
