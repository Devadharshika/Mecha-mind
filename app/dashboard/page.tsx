// app/dashboard/page.tsx
import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      {/* Top header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
            Mission Overview
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-slate-50">
            Welcome back, <span className="text-cyan-400">Pilot</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Your engineering systems are running nominally. Here&apos;s
            today&apos;s MechaMind status summary.
          </p>
        </div>
        <div className="text-right text-xs text-slate-400">
          MechaMind Status:{" "}
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-4 shadow-lg shadow-cyan-500/10">
          <p className="text-xs text-slate-400 mb-1">
            Engineering Focus Time (today)
          </p>
          <p className="text-3xl font-semibold text-cyan-300">2h 30m</p>
          <p className="text-[11px] text-emerald-400 mt-2">
            +40% vs yesterday
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-4 shadow-lg shadow-cyan-500/10">
          <p className="text-xs text-slate-400 mb-1">Concept Mastery</p>
          <p className="text-3xl font-semibold text-cyan-300">76%</p>
          <p className="text-[11px] text-slate-400 mt-2">
            Estimated from recent MechaMind sessions.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-4 shadow-lg shadow-cyan-500/10">
          <p className="text-xs text-slate-400 mb-1">
            Active Engineering Projects
          </p>
          <p className="text-3xl font-semibold text-cyan-300">3</p>
          <p className="text-[11px] text-emerald-400 mt-2">
            Hardware, simulation, and AI workflows.
          </p>
        </div>
      </section>

      {/* Lower section */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Activity log */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5">
          <h3 className="text-sm font-semibold mb-3 text-cyan-200">
            Recent Mission Log
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
              <div>
                <p>Completed robotics kinematics practice set.</p>
                <p className="text-[11px] text-slate-500">1 hour ago</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
              <div>
                <p>Reviewed control systems fundamentals with MechaMind.</p>
                <p className="text-[11px] text-slate-500">3 hours ago</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
              <div>
                <p>Generated a ROS navigation project outline.</p>
                <p className="text-[11px] text-slate-500">Yesterday</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold mb-1 text-cyan-200">
            Quick Actions
          </h3>

          <Link
            href="/dashboard/learn"
            className="block w-full px-4 py-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-400 text-black text-sm font-semibold text-center transition"
          >
            Start a Learning Session
          </Link>

          <Link
            href="/dashboard/build"
            className="block w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-center transition"
          >
            Generate New Project Blueprint
          </Link>

          <Link
            href="/dashboard/chat"
            className="block w-full px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[11px] text-cyan-200 text-center border border-cyan-500/40 transition"
          >
            Ask MechaMind to plan your next mission
          </Link>

          <p className="text-[11px] text-slate-500 pt-2">
            Later, you&apos;ll connect this dashboard to real projects,
            simulations, and skills. For now, these are mock values.
          </p>
        </div>
      </section>
    </>
  );
}
