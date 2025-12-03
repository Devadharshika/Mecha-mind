// app/dashboard/build/page.tsx
"use client";

import { useState, type FormEvent } from "react";

export default function BuildPage() {
  const [goal, setGoal] = useState("");
  const [hardware, setHardware] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [constraints, setConstraints] = useState("");
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoading) return;

    setIsLoading(true);
    setAiPlan(null);

    try {
      const res = await fetch("/api/project-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          hardware,
          difficulty,
          constraints,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Project Builder API error:", txt);
        throw new Error("API error");
      }

      const data = (await res.json()) as { reply?: string; error?: string };
      setAiPlan(
        data.reply ??
          data.error ??
          "MechaMind Project Builder is online, but I couldn't decode that response, Pilot."
      );
    } catch (err) {
      console.error(err);
      setAiPlan(
        "⚠️ MechaMind Project Builder hit a connection error. Try again in a moment, Pilot."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Project Builder
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">
          Build Robotics &amp; AI Projects
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          This page uses a dedicated MechaMind Project Builder engine. Give it a
          goal and hardware, and it will return a structured build plan.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1.4fr]">
        {/* Left: form */}
        <form
          onSubmit={handleGenerate}
          className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 space-y-4 shadow-lg shadow-cyan-900/40"
        >
          <h2 className="text-sm font-semibold text-cyan-200 mb-1">
            Project Blueprint Request
          </h2>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300">Goal</label>
            <input
              placeholder="e.g. Build a line-following robot with obstacle detection"
              className="w-full rounded-lg bg-slate-950/60 border border-slate-600/70 px-3 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300">Hardware</label>
              <input
                placeholder="Arduino, ESP32, Raspberry Pi, etc."
                className="w-full rounded-lg bg-slate-950/60 border border-slate-600/70 px-3 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                value={hardware}
                onChange={(e) => setHardware(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300">Difficulty</label>
              <select
                className="w-full rounded-lg bg-slate-950/60 border border-slate-600/70 px-3 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300">
              Extra constraints (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Budget, sensors, size, environment, tools available, etc."
              className="w-full rounded-lg bg-slate-950/60 border border-slate-600/70 px-3 py-2 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !goal.trim()}
            className="mt-2 w-full md:w-auto rounded-xl bg-cyan-500/80 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-slate-950 shadow shadow-cyan-500/30 transition"
          >
            {isLoading ? "Generating blueprint…" : "Generate Project Blueprint"}
          </button>

          <p className="text-[11px] text-slate-500 mt-2">
            This engine is separate from the AI Console. Later, you can version
            it and expose it as your startup&apos;s main API.
          </p>
        </form>

        {/* Right: AI result with blueprint preview */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 shadow-lg shadow-cyan-900/40 min-h-[220px] flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-cyan-200">
            Generated Blueprint
          </h2>

          {/* Blueprint visual panel */}
          <BlueprintPreview />

          {/* Textual plan */}
          <div className="mt-2 flex-1 overflow-y-auto">
            {aiPlan ? (
              <div className="text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiPlan}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                No blueprint generated yet. Fill in the fields on the left and
                press{" "}
                <span className="text-cyan-300 font-medium">
                  Generate Project Blueprint
                </span>{" "}
                to see MechaMind&apos;s plan.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function BlueprintPreview() {
  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-[#020617] px-3 py-3">
      <p className="text-[11px] text-cyan-200 mb-2">Blueprint Preview</p>
      <div className="h-32 w-full rounded-xl overflow-hidden bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] relative">
        {/* grid lines */}
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#0f172a66_1px,transparent_1px),linear-gradient(to_bottom,#0f172a66_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* simple robot top view using SVG */}
        <svg
          viewBox="0 0 200 120"
          className="absolute inset-0 mx-auto my-auto text-cyan-300"
        >
          {/* chassis */}
          <rect
            x="60"
            y="30"
            width="80"
            height="50"
            rx="8"
            ry="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* wheels */}
          <rect
            x="50"
            y="32"
            width="8"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="50"
            y="56"
            width="8"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="142"
            y="32"
            width="8"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="142"
            y="56"
            width="8"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* sensor arc */}
          <path
            d="M80 28 Q100 15 120 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* center module */}
          <rect
            x="88"
            y="42"
            width="24"
            height="26"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {/* axes lines */}
          <line
            x1="100"
            y1="85"
            x2="100"
            y2="110"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1="80"
            y1="95"
            x2="120"
            y2="95"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">
        Visual mock of a mobile robot. In a future version, this panel can be
        generated from your actual blueprint data.
      </p>
    </div>
  );
}
