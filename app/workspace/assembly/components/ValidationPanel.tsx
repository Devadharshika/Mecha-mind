"use client";

import { useAssembly } from "../../../../store/assemblyStore";
import { diagnoseAssembly } from "../../../../core/validation/assemblyDiagnostics";

export function ValidationPanel() {
  const { state } = useAssembly();

  const diagnostics = diagnoseAssembly(state);

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 backdrop-blur p-3 h-[180px] text-xs flex flex-col">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
        Validation
      </h2>

      <div className="flex-1 overflow-auto space-y-1">

        {/* 🔴 Reducer-level attachment validation */}
        {state.validationMessage && (
          <div className="text-red-300 text-[11px] border border-red-500/40 rounded-md px-2 py-1 bg-red-500/5">
            {state.validationMessage}
          </div>
        )}

        {/* 🔍 Assembly diagnostics */}
        {diagnostics.map((diag) => {
          const style =
            diag.level === "error"
              ? "text-red-300 border-red-500/40 bg-red-500/5"
              : diag.level === "warning"
              ? "text-amber-300 border-amber-500/40 bg-amber-500/5"
              : "text-slate-300 border-slate-500/40 bg-slate-500/5";

          return (
            <div
              key={diag.code}
              className={`text-[11px] border rounded-md px-2 py-1 ${style}`}
            >
              {diag.message}
            </div>
          );
        })}

        {/* 🟢 Success case */}
        {!state.validationMessage && diagnostics.length === 0 && (
          <div className="text-emerald-300 text-[11px]">
            Assembly looks structurally valid.
          </div>
        )}
      </div>
    </div>
  );
}