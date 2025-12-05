"use client";

import { useAssembly } from "../../../../store/assemblyStore";

const ROBOT_TYPES = [
  { id: "generic", label: "Generic" },
  { id: "drone", label: "Drone" },
  { id: "humanoid", label: "Humanoid" },
] as const;

export function WorkspaceToolbar() {
  const { state, dispatch } = useAssembly();

  return (
    <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between bg-slate-950/80 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          MechaMind – Assembly Workspace
        </h1>
        <p className="text-xs text-slate-400">
          Build universal robots with a premium engineering workflow.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-slate-900 border border-slate-700 px-2 py-1 text-xs">
          <span className="text-slate-400 mr-1">Robot Type:</span>
          {ROBOT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                dispatch({ type: "SET_ROBOT_TYPE", robotType: t.id as any })
              }
              className={`px-2 py-0.5 rounded-full transition ${
                state.robotType === t.id
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
