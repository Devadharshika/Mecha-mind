// core/validation/attachmentRules.ts

import type { PartCategory } from "../assemblyTypes";

/*
Philosophy (Design-time only)
--------------------------------
- Structure is the primary carrier.
- Vehicle modules attach to structure.
- Actuators attach to structure or vehicle.
- Sensors attach to structure or actuator.
- Tools attach to actuator.
- Power/control attach to structure.
- Root behaves like structure.
*/

type ParentCategory = PartCategory | "root";
type ChildCategory = PartCategory;

/*
IMPORTANT:
We explicitly define ALL parent categories
to satisfy Record<ParentCategory, ChildCategory[]>
*/

export const ATTACHMENT_RULES: Record<
  ParentCategory,
  ChildCategory[]
> = {
  // Root behaves like structure
  root: ["structure"],

  structure: [
    "structure",
    "vehicle",
    "actuator",
    "sensor",
    "control",
    "power",
    "tool",
    "custom",
  ],

  vehicle: [
    "actuator",
    "sensor",
    "custom",
  ],

  actuator: [
    "sensor",
    "tool",
    "custom",
  ],

  sensor: [
    "custom",
  ],

  control: [
    "custom",
  ],

  power: [
    "custom",
  ],

  tool: [
    "custom",
  ],

  joint: [
    "custom",
  ],

  custom: [
    "custom",
  ],
};

/* =========================================================
   Validation helper
   ========================================================= */

export function canAttach(
  parentCategory: ParentCategory,
  childCategory: ChildCategory
): boolean {
  const allowed = ATTACHMENT_RULES[parentCategory];
  return allowed.includes(childCategory);
}