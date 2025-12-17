"use client";

import { useEffect, useRef, useState } from "react";
import { simService } from "@/core/sim/simService";
import { applySimToAssembly } from "@/core/sim/sync";
import { useAssembly } from "@/store/assemblyStore";
import SimulationCanvas from "./SimulationCanvas";

interface SimulationShellProps {
  children?: React.ReactNode;
}

export default function SimulationShell({ children }: SimulationShellProps) {
  const { state: assemblyState, dispatch } = useAssembly();

  // Render state (read-only mirror of simService.state)
  const [simState, setSimState] = useState<any>(() => simService.state);
  const [entityCount, setEntityCount] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);

  const unsubRef = useRef<null | (() => void)>(null);
  const initializedRef = useRef(false);

  /* ---------------------------------------
     INITIALIZE + SUBSCRIBE (ONCE ONLY)
  --------------------------------------- */
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Subscribe FIRST
    const unsub = simService.subscribe((s: any) => {
      setSimState(s);
      setEntityCount(Object.keys(s.entities ?? {}).length);
      setRunning(Boolean(s.running));
    });
    unsubRef.current = unsub;

    // Create initial snapshot ONCE
    try {
      simService.createSnapshotFromAssembly(assemblyState);
    } catch (e) {
      console.warn("Simulation snapshot creation failed:", e);
    }

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  /* ---------------------------------------
     CONTROLS (NO AUTO MUTATION)
  --------------------------------------- */
  function onStart() {
    console.log("UI START CLICKED");
    simService.start();
  }

  function onPause() {
    simService.pause();
  }

  function onStep() {
    simService.stepOnce();
  }

  function onReset() {
    simService.reset(true);
    simService.createSnapshotFromAssembly(assemblyState);
  }

  function onApply() {
    applySimToAssembly(dispatch);
  }

  /* ---------------------------------------
     RENDER
  --------------------------------------- */
  return (
    <div className="w-full h-full flex flex-col">
      {/* Debug control strip (Phase C) */}
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

        <button className="text-cyan-400" onClick={onStep}>
          Step
        </button>

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

      {/* 3D Simulation */}
      <div className="flex-1 bg-neutral-900">
        <SimulationCanvas simState={simState} />
      </div>
    </div>
  );
}
