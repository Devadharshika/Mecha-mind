"use client";
import SimulationCanvas from "./SimulationCanvas";
import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  SlidersHorizontal,
  Activity,
  Radar,
  Route,
  AlertTriangle,
  Terminal,
} from "lucide-react";

/* --- keep the robotModels / controlModes you already had --- */
const robotModels = [
  { id: "arm6dof", label: "6-DOF Industrial Arm" },
  { id: "mobile_rover", label: "Mobile Rover" },
  { id: "humanoid_torso", label: "Humanoid Torso" },
];

const controlModes = [
  { id: "direct", label: "Direct Joint Control" },
  { id: "ik", label: "Inverse Kinematics" },
  { id: "path", label: "Path Planning" },
  { id: "auto", label: "Autonomous Script" },
];

/* --- NEW: sim core + store imports --- */
import { useAssembly } from "../../../store/assemblyStore"; // relative from app/workspace/simulate/page.tsx
import { simService } from "../../../core/sim/simService";
import { applySimToAssembly } from "../../../core/sim/sync";

/* --- Page component --- */
export default function SimulateRobotsPage() {
  // existing UI state
  const [selectedRobot, setSelectedRobot] = useState("arm6dof");
  const [controlMode, setControlMode] = useState("direct");
  const [isRunning, setIsRunning] = useState(false);

  // sim related UI state
  const [entityCount, setEntityCount] = useState(0);
  const unsubRef = useRef<(() => void) | null>(null);

  // get assembly store (state + dispatch) via your hook
  const { state: assemblyState, dispatch } = useAssembly();

  /* -------------------------
     Snapshot + subscription
     ------------------------- */
  useEffect(() => {
    // create a sim snapshot from the current assembly state
    // safe to call repeatedly; this refreshes sim state to match assembly
    try {
      simService.createSnapshotFromAssembly(assemblyState);
    } catch (e) {
      // fail gracefully in dev - service should exist
      // console.error("sim snapshot error", e);
    }

    // subscribe to sim updates (entity counts, telemetry, etc.)
    const unsub = simService.subscribe((s) => {
      setEntityCount(Object.keys(s.entities).length);
    });
    unsubRef.current = unsub;

    // cleanup
    return () => {
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = null;
    };
    // Recreate snapshot when the assembly root or nodes change.
    // If your assemblyState is a new object every render, you may want to depend on rootId only.
  }, [assemblyState]); // intentionally resnapshot on assembly changes

  /* -------------------------
     Controls (Start / Pause / Step / Apply)
     ------------------------- */
  function onStart() {
    simService.start();
    setIsRunning(true);
  }
  function onPause() {
    simService.pause();
    setIsRunning(false);
  }
  function onStep() {
    simService.stepOnce();
  }
  function onApply() {
    // apply sim transforms back into the assembly store using dispatch
    // applySimToAssembly expects your dispatch from useAssembly
    applySimToAssembly(dispatch);
  }

  /* -------------------------
     (rest of your existing UI layout below - unchanged except wiring)
     ------------------------- */
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50 flex items-center gap-2">
            <Bot className="w-7 h-7 text-cyan-400" />
            Simulate Robots
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">
            Visualize, control, and test robotic systems in a high-fidelity virtual lab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Simulation Sandbox Active
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-6">
        {/* 3D View Panel */}
        <section className="relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-3 border-b border-slate-800/70 backdrop-blur-sm bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm md:text-base font-medium text-slate-100">
                3D Simulation View
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Physics: Enabled
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                r3f Scene Placeholder
              </div>
            </div>
          </div>

          {/* Placeholder 3D canvas area */}
          <div className="relative h-[360px] md:h-[420px] lg:h-[460px]">
            <div className="absolute inset-0">
              {/* Background grid / pattern */}
              <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.05),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.08),_transparent_60%)]" />
              <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border border-cyan-400/10 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
              <div className="pointer-events-none absolute inset-[18%] border border-slate-700/70 rounded-[1.25rem] bg-slate-950/40 backdrop-blur-sm" />
              <div className="pointer-events-none absolute inset-[22%] rounded-[1rem] border border-slate-800/70 border-dashed" />
            </div>

            {/*<div className="relative z-10 w-full h-full flex items-center justify-center flex-col gap-4 px-4 text-center">
              <div className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/5 px-3 py-1 text-[10px] md:text-xs text-cyan-200 mb-1">
                r3f / Three.js slot — ready for integration
              </div>
              <p className="text-base md:text-lg font-medium text-slate-50 flex items-center gap-2">
                3D Robot Simulation Canvas
              </p>
              <p className="max-w-xl text-xs md:text-sm text-slate-400">
                This panel will render your interactive 3D robot models with full physics,
                joint manipulation, and real-time sensor overlays. You can plug your
                <span className="text-cyan-300"> react-three-fiber </span>
                scene directly here.
              </p>
            </div>*/}
            <div className="absolute inset-0">
                 <SimulationCanvas running={isRunning} />
            
            </div>


            {/* Corner HUD badges */}
            <div className="pointer-events-none absolute left-4 bottom-4 flex flex-col gap-2 text-[10px] md:text-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1">
                <Route className="w-3 h-3 text-cyan-300" />
                <span className="text-slate-200">Workspace: MechaLab v1.0</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1">
                <Radar className="w-3 h-3 text-emerald-300" />
                <span className="text-slate-300">Collision overlay: Armed</span>
              </div>
            </div>

            <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-2 text-[10px] md:text-xs">
              <div className="rounded-md bg-slate-950/80 border border-slate-800/80 px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">60 FPS (mock)</span>
                </div>
              </div>
              <div className="rounded-md bg-slate-950/80 border border-slate-800/80 px-2 py-1">
                <span className="text-slate-400">Robot: {robotModels.find(r => r.id === selectedRobot)?.label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right column: controls + telemetry */}
        <div className="flex flex-col gap-6">
          {/* Simulation controls card */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.7)] p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm md:text-base font-medium text-slate-100">
                  Simulation Controls
                </h2>
              </div>
              <span className="text-[10px] md:text-xs text-slate-500">
                All values are UI-only mocks for now
              </span>
            </div>

            {/* Robot selection */}
            <div className="space-y-2">
              <label className="text-[11px] md:text-xs uppercase tracking-wide text-slate-400">
                Robot Model
              </label>
              <div className="relative">
                <select
                  value={selectedRobot}
                  onChange={(e) => setSelectedRobot(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-xs md:text-sm text-slate-100 shadow-inner outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/60"
                >
                  {robotModels.map((robot) => (
                    <option key={robot.id} value={robot.id}>
                      {robot.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Control modes */}
            <div className="space-y-2">
              <label className="text-[11px] md:text-xs uppercase tracking-wide text-slate-400">
                Control Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {controlModes.map((mode) => {
                  const active = controlMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setControlMode(mode.id)}
                      className={`rounded-xl border px-2.5 py-2 text-[11px] md:text-xs text-left transition-all ${
                        active
                          ? "border-cyan-400/80 bg-cyan-400/10 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                          : "border-slate-800 bg-slate-950/80 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-900"
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onStart();
                    // keep local UI flag in sync
                    setIsRunning(true);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-medium transition-all ${
                    isRunning
                      ? "border border-emerald-400/70 bg-emerald-400/15 text-emerald-100"
                      : "border border-emerald-500/70 bg-emerald-500/20 text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPause();
                    setIsRunning(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-400/10 px-3 py-1.5 text-[11px] md:text-xs font-medium text-amber-100 hover:bg-amber-400/15"
                >
                  <Pause className="w-3 h-3" />
                  Pause
                </button>
                <button
                  type="button"
                  onClick={() => {
                    simService.reset(); // optionally recreate snapshot on reset
                    setIsRunning(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400">
                <span
                  className={`h-1.5 w-10 rounded-full ${
                    isRunning ? "bg-emerald-400" : "bg-slate-700"
                  }`}
                />
                {isRunning ? "Running" : "Idle"}
                <span className="ml-3 text-slate-400">Entities: {entityCount}</span>
              </div>
            </div>

            {/* Mock joint sliders */}
            <div className="mt-1 space-y-2">
              <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-400">
                <span>Joint Preview (UI only)</span>
                <span>J1 · J2 · J3 · J4 · J5 · J6</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[1, 2, 3].map((joint) => (
                  <div key={joint} className="flex items-center gap-2">
                    <span className="w-8 text-[10px] md:text-xs text-slate-500">
                      J{joint}
                    </span>
                    <div className="relative flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-cyan-500/70 to-emerald-400/80" />
                    </div>
                    <span className="w-10 text-right text-[10px] md:text-xs text-slate-400">
                      {joint * 15}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Telemetry & logs */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telemetry */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs md:text-sm font-medium text-slate-100">
                    Live Telemetry (Mock)
                  </h3>
                </div>
                <span className="text-[9px] md:text-[10px] text-slate-500">
                  Stream: 100 Hz (simulated)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">End-Effector</div>
                  <div className="mt-1 text-slate-200">
                    x: <span className="text-cyan-300">0.42</span> m
                  </div>
                  <div className="text-slate-200">
                    y: <span className="text-cyan-300">0.18</span> m
                  </div>
                  <div className="text-slate-200">
                    z: <span className="text-cyan-300">0.63</span> m
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">Joint Load</div>
                  <div className="mt-1 text-slate-200">
                    Max τ: <span className="text-emerald-300">36%</span>
                  </div>
                  <div className="text-slate-200">
                    RMS τ: <span className="text-emerald-300">21%</span>
                  </div>
                  <div className="text-slate-200">
                    Temp: <span className="text-amber-300">42°C</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">IMU (Base)</div>
                  <div className="mt-1 text-slate-200">
                    Pitch: <span className="text-cyan-300">1.2°</span>
                  </div>
                  <div className="text-slate-200">
                    Roll: <span className="text-cyan-300">0.6°</span>
                  </div>
                  <div className="text-slate-200">
                    Yaw: <span className="text-cyan-300">-0.4°</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">Status</div>
                  <div className="mt-1 flex items-center gap-1 text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    No collisions
                  </div>
                  <div className="text-slate-200">
                    Latency: <span className="text-cyan-300">4.1 ms</span>
                  </div>
                  <div className="text-slate-200">
                    Step: <span className="text-cyan-300">Δt = 1/120 s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs / scripts */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs md:text-sm font-medium text-slate-100">
                    Console & Scripts
                  </h3>
                </div>
                <span className="text-[9px] md:text-[10px] text-slate-500">
                  Scripting sandbox (future)
                </span>
              </div>

              <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-2 text-[10px] md:text-xs font-mono text-slate-300 overflow-hidden">
                <div className="text-slate-500 mb-1">[Mock Log Stream]</div>
                <div className="space-y-1 max-h-36 overflow-auto">
                  <div>
                    <span className="text-cyan-300">[INFO]</span> Loaded robot:
                    6-DOF Industrial Arm
                  </div>
                  <div>
                    <span className="text-cyan-300">[INFO]</span> Control mode set to:
                    Direct Joint Control
                  </div>
                  <div>
                    <span className="text-emerald-300">[SIM]</span> Physics engine ready,
                    gravity = (0, 0, -9.81)
                  </div>
                  <div>
                    <span className="text-emerald-300">[SIM]</span> Joint limits validated
                    for all 6 DOF
                  </div>
                  <div>
                    <span className="text-cyan-300">[HINT]</span> Attach your controller
                    logic to the simulation loop here.
                  </div>
                  <div className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Safety note: always validate joint targets before executing.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-cyan-500/70 bg-cyan-500/15 px-3 py-2 text-[11px] md:text-xs font-medium text-cyan-100 hover:bg-cyan-500/25 transition-colors"
              >
                Open Script Editor (coming soon)
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
