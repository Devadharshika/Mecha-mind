// core/assemblies/rover_v1.ts

import { AssemblyState } from "../assemblyTypes";
import { uid } from "../uid";

/**
 * Rover v1 — Minimal design-time assembly
 * No simulation. No control. No inference.
 */
export function createRoverV1Assembly(): AssemblyState {

  const rootId = uid("root");

  const chassisId = uid("chassis");
  const leftWheelId = uid("left_wheel");
  const rightWheelId = uid("right_wheel");

  const nodes: AssemblyState["nodes"] = {

    [rootId]: {
      id: rootId,
      name: "Rover Root",
      partId: null,
      category: "root",
      parentId: null,
      children: [chassisId],
    },

    [chassisId]: {
      id: chassisId,
      name: "Chassis",
      partId: "mm-str-base-link",   // ✅ valid structure part
      category: "structure",
      parentId: rootId,
      children: [leftWheelId, rightWheelId],
    },

    [leftWheelId]: {
      id: leftWheelId,
      name: "Left Wheel",
      partId: "mm-str-base-link",   // reuse same part for now
      category: "vehicle",
      parentId: chassisId,
      children: [],
      transform: {
        pos: [-1, 0, -0.2],
      },
    },

    [rightWheelId]: {
      id: rightWheelId,
      name: "Right Wheel",
      partId: "mm-str-base-link",
      category: "vehicle",
      parentId: chassisId,
      children: [],
      transform: {
        pos: [1, 0, -0.2],
      },
    },
  };

  const leftJointId = uid("joint_left");
  const rightJointId = uid("joint_right");

  const joints: AssemblyState["joints"] = {

    [leftJointId]: {
      id: leftJointId,
      parentId: chassisId,
      childId: leftWheelId,
      type: "revolute",
      axis: [0, 1, 0],
    },

    [rightJointId]: {
      id: rightJointId,
      parentId: chassisId,
      childId: rightWheelId,
      type: "revolute",
      axis: [0, 1, 0],
    },
  };

  return {
    robotType: "rover",
    rootId,
    nodes,
    joints,
    selectedNodeId: null,
  };
}