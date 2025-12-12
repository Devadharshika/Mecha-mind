"use client";

import { useEffect, useRef, useState } from "react";
import { simService } from "../../../core/sim/simService";
import { applySimToAssembly } from "../../../core/sim/sync";
import { useAssembly } from "../../../store/assemblyStore";
import SimulationCanvas from "./SimulationCanvas";

/**
 * Lightweight shell that:
 * - creates a snapshot from the assembly on mount / when assembly changes
 * - subscribes to simService updates and keeps simState for the canvas/UI
 * - exposes control handlers (start / pause / step / reset / apply)
 *
 * Notes:
 * - simState is typed as `any` for now to avoid TS friction while iterating.
 *   Replace `any` with your SimState type from core/sim/simState.ts if you prefer strict typing.
 */

interface SimulationShellProps {
  children?: React.ReactNode;
}

export default function SimulationShell({ children }: SimulationShellProps) {
  const { state: assemblyState, dispatch } = useAssembly();

  // live sim snapshot/state for canvas and UI
  const [simState, setSimState] = useState<any>(() => simService.state ?? {});
  const [entityCount, setEntityCount] = useState<number>(
    () => Object.keys(simService.state?.entities ?? {}).length
  );
  const [running, setRunning] = useState<boolean>(false);

  const unsubRef = useRef<null | (() => void)>(null);

  //
  // --- SETUP SIM SNAPSHOT + SUBSCRIBE TO UPDATES ---
  //
  useEffect(() => {
    // create a snapshot from assembly whenever assemblyState changes
    try {
      simService.createSnapshotFromAssembly(assemblyState);
    } catch (e) {
      console.warn("Simulation snapshot creation failed:", e);
    }

    // subscribe to simService updates
    const unsub = simService.subscribe((s: any) => {
      setSimState(s);
      setEntityCount(Object.keys(s.entities ?? {}).length);
      // If your simService exposes running state inside s, you could sync here:
      // setRunning(Boolean(s.running));
    });
    unsubRef.current = unsub;

    // cleanup
    return () => {
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = null;
    };
  }, [assemblyState]);

  //
  // --- CONTROL BUTTON HANDLERS ---
  //
  function onStart() {
    simService.start();
    setRunning(true);
  }

  function onPause() {
    simService.pause();
    setRunning(false);
  }

  function onStep() {
    simService.stepOnce();
  }

  function onReset() {
    // reset optionally recreates snapshot (true => recreate from assembly)
    simService.reset(true);
    setRunning(false);
  }

  function onApply() {
    applySimToAssembly(dispatch);
  }

  //
  // --- UI ---
  //
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

        <button className="text-cyan-400" onClick={onStep}>
          Step
        </button>
        <button className="text-amber-400" onClick={onReset}>
          Reset
        </button>

        <button className="text-blue-400" onClick={onApply}>
          Apply → Assembly
        </button>

        {/* show a small running indicator */}
        <div className="ml-auto text-[11px] text-slate-400">
          {running ? "Running" : "Idle"}
        </div>
      </div>

      {/* The simulation 3D canvas or placeholder */}
      <div className="flex-1 bg-neutral-900">
        {/* pass simState into the canvas so it can render debug cubes */}
        <SimulationCanvas simState={simState} />
      </div>
    </div>
  );
}
