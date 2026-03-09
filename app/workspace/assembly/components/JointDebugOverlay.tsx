"use client";

import React from "react";
import { useAssembly } from "@/store/assemblyStore";

/**
 * Debug-only visualization for assembly joints.
 * Read-only. No interaction. No behavior.
 */
export default function JointDebugOverlay() {
  const { state } = useAssembly();
  const { joints, nodes, selectedNodeId } = state;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",

        /* Raised so lines appear above snapshot card */
        zIndex: 50,

        /*
          Previously:
          zIndex: 10

          Commented, not deleted, for future tuning.
        */
      }}
    >
      {Object.values(joints).map((joint) => {
        const parent = nodes[joint.parentId];
        const child = nodes[joint.childId];

        if (!parent || !child) return null;

        const p = parent.transform?.pos ?? [0, 0, 0];
        const c = child.transform?.pos ?? [0, 0, 0];

        // Debug projection: X/Z → screen plane
        const centerX = 150;
        const centerY = 90;
        const scale = 40;

        const x1 = centerX + p[0] * scale;
        const y1 = centerY + p[2] * scale;
        const x2 = centerX + c[0] * scale;
        const y2 = centerY + c[2] * scale;

        const isHighlighted =
          selectedNodeId &&
          (joint.parentId === selectedNodeId ||
            joint.childId === selectedNodeId);

        /*
          Old behavior:
          all joints rendered, highlighted one thicker.
          Preserved for future debugging.
        */
        /*
        return (
          <line
            key={joint.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={
              isHighlighted
                ? "rgba(255, 200, 0, 1)"
                : "rgba(0, 200, 255, 0.8)"
            }
            strokeWidth={isHighlighted ? 4 : 2}
            strokeDasharray="4 2"
          />
        );
        */

        // NEW: render only selected-node joints
        if (!isHighlighted) return null;

        return (
          <line
            key={joint.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255, 200, 0, 1)"
            strokeWidth={4}
            strokeDasharray="4 2"
          />
        );
      })}
    </svg>
  );
}
