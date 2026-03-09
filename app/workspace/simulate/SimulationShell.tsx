"use client";

import { useEffect, useRef, useState } from "react";
import { simService } from "../../../core/sim/simService";
import { applySimToAssembly } from "../../../core/sim/sync";
import { useAssembly } from "../../../store/assemblyStore";
import SimulationCanvas from "./SimulationCanvas";

import { compileAssembly } from "../../../core/compiler/compileAssembly";

export default function SimulationShell() {
  const { state: assemblyState, dispatch } = useAssembly();

  const [simState, setSimState] = useState(simService.state);
  const [entityCount, setEntityCount] = useState(
    Object.keys(simService.state.entities ?? {}).length
  );
  const [running, setRunning] = useState(simService.state.running);

  const unsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {

    /* -------------------------------------------------
       OLD TIMER WRAPPER (COMMENTED — DO NOT DELETE)
       This sometimes prevented the compiler from running
       due to React cleanup timing.
    ------------------------------------------------- */

    /*
    const timer = setTimeout(() => {
      (async () => {
    */

    (async () => {

      /* -------------------------------------------------
         OLD PROTOTYPE PATH (COMMENTED — DO NOT DELETE)
      ------------------------------------------------- */

      // simService.createSnapshotFromAssembly(assemblyState);

      /* -------------------------------------------------
         NEW PIPELINE
         Assembly → Compiler → Simulation
      ------------------------------------------------- */

      console.log("ASSEMBLY STATE", assemblyState);

      const result = await compileAssembly(assemblyState);

      /* -------------------------------------------------
         DIAGNOSTIC OUTPUT
         (THIS WILL TELL US EXACTLY WHAT FAILED)
      ------------------------------------------------- */

      console.log("=== COMPILER RESULT ===");
      console.log(result);

      if (!result.success) {
        console.error("=== COMPILER ERRORS ===");
        console.error(result.errors);
        return;
      }

      if (!result.spec) {
        console.error("Compiler returned success but spec is missing.");
        return;
      }

      console.log("=== COMPILED BODIES ===");
      console.log(result.spec.bodies);

      console.log("=== COMPILED JOINTS ===");
      console.log(result.spec.joints);

      /* -------------------------------------------------
         INITIALIZE SIMULATION
      ------------------------------------------------- */

      simService.initializeFromSpec(result.spec);

    })();

    /*
      })();
    }, 50);
    */

    let rafId: number | null = null;

    const unsub = simService.subscribe((s) => {
      if (rafId != null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        setSimState(s);
        setEntityCount(Object.keys(s.entities ?? {}).length);
        setRunning(s.running);
      });
    });

    unsubRef.current = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      unsub();
    };

    return () => {

      /* -------------------------------------------------
         OLD TIMER CLEANUP (COMMENTED — DO NOT DELETE)
      ------------------------------------------------- */

      // clearTimeout(timer);

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
    simService.reset();
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
          running={running}
        />
      </div>

    </div>
  );
}