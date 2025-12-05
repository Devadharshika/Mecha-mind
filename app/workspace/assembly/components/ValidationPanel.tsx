"use client";

import { useAssembly } from "../../../../store/assemblyStore";

export function ValidationPanel() {
  const { state } = useAssembly();

  const hasAnyActuators = Object.values(state.nodes).some(
    (n) => n.category === "actuator"
  );
  const hasAnyPower = Object.values(state.nodes).some(
    (n) => n.category === "power"
  );

  const issues: string[] = [];
  if (!hasAnyActuators) issues.push("No actuators added yet.");
  if (!hasAnyPower) issues.push("No power source added yet.");

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-[140px] text-xs flex flex-col">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
        Quick Checks
      </h2>
      <div className="flex-1 overflow-auto space-y-1">
        {issues.length === 0 ? (
          <div className="text-emerald-300 text-[11px]">
            Assembly looks good for now. Keep building.
          </div>
        ) : (
          issues.map((msg, i) => (
            <div
              key={i}
              className="text-amber-300 text-[11px] border border-amber-500/40 rounded-md px-2 py-1 bg-amber-500/5"
            >
              {msg}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
