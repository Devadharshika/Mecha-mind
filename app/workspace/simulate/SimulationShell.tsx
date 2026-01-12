"use client";

import { useEffect, useRef, useState } from "react";
import { simService } from "../../../core/sim/simService";
import { applySimToAssembly } from "../../../core/sim/sync";
import { useAssembly } from "../../../store/assemblyStore";
import SimulationCanvas from "./SimulationCanvas";

export default function SimulationShell() {
  const { state: assemblyState, dispatch } = useAssembly();

  const [simState, setSimState] = useState(simService.state);
  const [entityCount, setEntityCount] = useState(
    Object.keys(simService.state.entities ?? {}).length
  );
  const [running, setRunning] = useState(simService.state.running);

  const unsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      simService.createSnapshotFromAssembly(assemblyState);
    }, 50);

    let rafId: number | null = null;

    const unsub = simService.subscribe((s) => {
      if (rafId != null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        setSimState(s);
        setEntityCount(Object.keys(s.entities ?? {}).length);
        setRunning(s.running); // 🔑 SINGLE SOURCE OF TRUTH
      });
    });

    unsubRef.current = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      unsub();
    };

    return () => {
      clearTimeout(timer);
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [assemblyState]);

  function onStart() {
    simService.start();
  }

  function onPause() {
    simService.pause();
  }

  function onReset() {
    simService.reset(); // 🔑 HARD RESET (no args)
  }

  function onApply() {
    applySimToAssembly(dispatch);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 bg-slate-900 border-b border-slate-800 text-slate-300 text-xs flex items-center gap-4">
        <span>Entities: {entityCount}</span>

        {running ? (
          <button className="text-red-400" onClick={onPause}>
            Pause
          </button>
        ) : (
          <button className="text-emerald-400" onClick={onStart}>
            Start
          </button>
        )}

        <button className="text-amber-400" onClick={onReset}>
          Reset
        </button>

        <button className="text-blue-400" onClick={onApply}>
          Apply → Assembly
        </button>

        <div className="ml-auto text-[11px] text-slate-400">
          {running ? "Running" : "Idle"}
        </div>
      </div>

      <div className="flex-1 bg-neutral-900">
        <SimulationCanvas
          simState={simState}
          running={running} // 🔑 PASS CLOCK DOWN
        />
      </div>
    </div>
  );
}
