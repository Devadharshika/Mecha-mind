"use client";

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

import { useAssembly } from "../../../store/assemblyStore";
import { simService } from "../../../core/sim/simService";
import { applySimToAssembly } from "../../../core/sim/sync";

// ⭐ NEW: import the shell
import SimulationShell from "./SimulationShell";

export default function SimulateRobotsPage() {
  const [selectedRobot, setSelectedRobot] = useState("arm6dof");
  const [controlMode, setControlMode] = useState("direct");
  const [isRunning, setIsRunning] = useState(false);

  const [entityCount, setEntityCount] = useState(0);
  const unsubRef = useRef<(() => void) | null>(null);

  const { state: assemblyState, dispatch } = useAssembly();

  // Snapshot + subscription
  useEffect(() => {
    try {
      simService.createSnapshotFromAssembly(assemblyState);
    } catch (e) {}

    const unsub = simService.subscribe((s) => {
      setEntityCount(Object.keys(s.entities).length);
    });
    unsubRef.current = unsub;

    return () => {
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = null;
    };
  }, [assemblyState]);

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
  function onReset() {
    simService.reset(true);
    setIsRunning(false);
  }
  function onApply() {
    applySimToAssembly(dispatch);
  }

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

        {/* ⭐ REAL SimulationShell replaces the entire UI placeholder panel */}
        <section className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden h-[360px] md:h-[420px] lg:h-[460px]">
          <SimulationShell />
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
                UI-only (sim core is running)
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
                          ? "border-cyan-400/80 bg-cyan-400/10 text-cyan-100"
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
                    setIsRunning(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/70 bg-emerald-500/20 px-3 py-1.5 text-[11px] md:text-xs font-medium text-emerald-50"
                >
                  <Play className="w-3 h-3" />
                  Start
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPause();
                    setIsRunning(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-400/10 px-3 py-1.5 text-[11px] md:text-xs font-medium text-amber-100"
                >
                  <Pause className="w-3 h-3" />
                  Pause
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onReset();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
                <span className={`h-1.5 w-10 rounded-full ${
                  isRunning ? "bg-emerald-400" : "bg-slate-700"
                }`} />
                {isRunning ? "Running" : "Idle"}
                <span className="ml-3 text-slate-400">Entities: {entityCount}</span>
              </div>
            </div>

          </section>

          {/* Telemetry + Logs (unchanged UI) */}
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

              {/* mock values unchanged */}
              <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">End-Effector</div>
                  <div className="mt-1 text-slate-200">x: <span className="text-cyan-300">0.42</span> m</div>
                  <div className="text-slate-200">y: <span className="text-cyan-300">0.18</span> m</div>
                  <div className="text-slate-200">z: <span className="text-cyan-300">0.63</span> m</div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">Joint Load</div>
                  <div className="mt-1 text-slate-200">Max τ: <span className="text-emerald-300">36%</span></div>
                  <div className="text-slate-200">RMS τ: <span className="text-emerald-300">21%</span></div>
                  <div className="text-slate-200">Temp: <span className="text-amber-300">42°C</span></div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">IMU (Base)</div>
                  <div className="mt-1 text-slate-200">Pitch: <span className="text-cyan-300">1.2°</span></div>
                  <div className="text-slate-200">Roll: <span className="text-cyan-300">0.6°</span></div>
                  <div className="text-slate-200">Yaw: <span className="text-cyan-300">-0.4°</span></div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-2">
                  <div className="text-slate-400">Status</div>
                  <div className="mt-1 flex items-center gap-1 text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> No collisions
                  </div>
                  <div className="text-slate-200">Latency: <span className="text-cyan-300">4.1 ms</span></div>
                  <div className="text-slate-200">Step: <span className="text-cyan-300">Δt = 1/120 s</span></div>
                </div>
              </div>
            </div>

            {/* Logs */}
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
                  <div><span className="text-cyan-300">[INFO]</span> Loaded robot: 6-DOF Industrial Arm</div>
                  <div><span className="text-cyan-300">[INFO]</span> Control mode set to: Direct Joint Control</div>
                  <div><span className="text-emerald-300">[SIM]</span> Physics engine ready, gravity = (0,0,-9.81)</div>
                  <div><span className="text-emerald-300">[SIM]</span> Joint limits validated</div>
                  <div><span className="text-cyan-300">[HINT]</span> Attach controller logic to simulation loop.</div>
                  <div className="text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Safety note: validate joint targets.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-cyan-500/70 bg-cyan-500/15 px-3 py-2 text-[11px] md:text-xs font-medium text-cyan-100 hover:bg-cyan-500/25"
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
