"use client";

import React from "react";
import { useAssembly } from "@/store/assemblyStore";

/**
 * Debug-only visualization for assembly joints.
 * Read-only. No interaction. No behavior.
 */
export default function JointDebugOverlay() {
  const { state } = useAssembly();
  const { joints, nodes } = state;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {Object.values(joints).map((joint) => {
        const parent = nodes[joint.parentId];
        const child = nodes[joint.childId];

        if (!parent || !child) return null;

        const p = parent.transform?.pos ?? [0, 0, 0];
        const c = child.transform?.pos ?? [0, 0, 0];

        // Debug projection: X/Z → screen plane (simple & intentional)
        const x1 = p[0] * 50 + 200;
        const y1 = p[2] * 50 + 200;
        const x2 = c[0] * 50 + 200;
        const y2 = c[2] * 50 + 200;

        return (
          <line
            key={joint.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0, 200, 255, 0.8)"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        );
      })}
    </svg>
  );
}
