"use client";

import { useAssembly } from "../../../../store/assemblyStore";

export function RobotCanvas() {
  const { state } = useAssembly();

  const total = Object.keys(state.nodes).length - 1; // minus root
  const byCategory: Record<string, number> = {};
  Object.values(state.nodes).forEach((n) => {
    if (n.category === "root") return;
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
  });

  return (
    <div className="border border-slate-800 rounded-xl bg-gradient-to-br from-slate-900/70 via-slate-900 to-slate-950 p-4 flex flex-col h-56">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Robot Canvas (Preview Stub)
        </h2>
        <span className="text-[10px] text-slate-400">
          {state.robotType.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="border border-slate-700/80 rounded-2xl px-6 py-4 text-center bg-slate-950/70">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
            Virtual Assembly Snapshot
          </div>
          <div className="text-3xl font-semibold text-emerald-400 mb-2">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mb-2">
            active parts attached
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-[10px]">
            {Object.entries(byCategory).map(([cat, count]) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900/80 text-slate-200"
              >
                {cat}: {count}
              </span>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <span className="text-slate-500">
                No parts yet – add from the library.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
