"use client";

import { useAssembly } from "../../../../store/assemblyStore";
import JointDebugOverlay from "./JointDebugOverlay";

/**
 * RobotCanvas
 *
 * IMPORTANT:
 * - This is a DESIGN-TIME preview stub.
 * - It must NEVER simulate, animate, or execute behavior.
 * - It only OBSERVES AssemblyState.
 *
 * Any future visualization (3D, joints, frames) must remain READ-ONLY.
 */
export function RobotCanvas() {
  const { state } = useAssembly();

  /* =========================================================
     Existing summary logic (PRESERVED)
     ========================================================= */

  const total = Object.keys(state.nodes).length - 1;

  const byCategory: Record<string, number> = {};
  Object.values(state.nodes).forEach((n) => {
    if (n.category === "root") return;
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
  });

  const joints = Object.values(state.joints);

  const selectedNode =
    state.selectedNodeId &&
    state.nodes[state.selectedNodeId];

  return (
    <div className="relative border border-slate-800 rounded-xl bg-gradient-to-br from-slate-900/70 via-slate-900 to-slate-950 p-4 flex flex-col h-96"
>

      {/* OLD OVERLAY LOCATION (COMMENTED, NOT DELETED)
          <JointDebugOverlay />
      */}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Robot Canvas (Preview Stub)
        </h2>
        <span className="text-[10px] text-slate-400">
          {state.robotType.toUpperCase()}
        </span>
      </div>

      {/* Snapshot area */}
      <div className="flex-1 flex items-center justify-center relative">
        <JointDebugOverlay />

        <div className="border border-slate-700/80 rounded-2xl px-6 py-4 text-center bg-slate-950/70 relative">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
            Virtual Assembly Snapshot
          </div>

          <div className="text-3xl font-semibold text-emerald-400 mb-2">
            {total}
          </div>

          <div className="text-[11px] text-slate-400 mb-2">
            active parts attached
          </div>

          {/* OLD CATEGORY RENDER (PRESERVED)
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            ...
          </div>
          */}

          {/* NEW: selected part highlight */}
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            {Object.entries(byCategory).map(([cat, count]) => {
              const isSelectedCategory =
                selectedNode && selectedNode.category === cat;

              return (
                <span
                  key={cat}
                  className={`px-2 py-0.5 rounded-full border ${
                    isSelectedCategory
                      ? "border-amber-400 bg-amber-500/20 text-amber-300"
                      : "border-slate-700 bg-slate-900/80 text-slate-200"
                  }`}
                >
                  {cat}: {count}
                </span>
              );
            })}

            {Object.keys(byCategory).length === 0 && (
              <span className="text-slate-500">
                No parts yet – add from the library.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Joint list */}
      {joints.length > 0 && (
        <div className="mt-3 border border-slate-800 rounded-xl bg-slate-950/80 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">
            Design-Time Joints (Read-Only)
          </div>

          <div className="space-y-2 text-[11px] text-slate-300">
            {joints.map((j) => {
              const parent = state.nodes[j.parentId];
              const child = state.nodes[j.childId];

              return (
                <div
                  key={j.id}
                  className="flex justify-between items-center border border-slate-800 rounded-lg px-3 py-2 bg-slate-900/70"
                >
                  <div>
                    <div className="font-medium text-slate-200">
                      {parent?.name} → {child?.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {j.type} joint
                    </div>
                  </div>

                  {j.axis && (
                    <div className="text-[10px] text-emerald-400 font-mono">
                      axis [{j.axis.join(", ")}]
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FUTURE FEATURES (PRESERVED)
             - 3D frames
             - manipulators
             - axis widgets
          */}
        </div>
      )}
    </div>
  );
}
