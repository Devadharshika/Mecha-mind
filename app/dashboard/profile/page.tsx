// app/dashboard/profile/page.tsx

export default function ProfilePage() {
  return (
    <>
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">
          Pilot Profile
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">
          Profile &amp; Progress
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl">
          Your personal engineering trajectory. MechaMind analyzes your sessions
          and gradually builds an intelligence profile to guide your growth.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1.2fr]">
        {/* LEFT SIDE */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-sm font-semibold text-cyan-100">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Pilot (You)
              </p>
              <p className="text-[11px] text-slate-400">
                MechaMind early access user
              </p>
            </div>
          </div>

          {/* Rank */}
          <div className="rounded-xl border border-slate-600/70 bg-slate-950/60 px-4 py-3">
            <p className="text-[11px] text-slate-400 mb-1">Rank • Assigned</p>
            <p className="text-base font-semibold text-cyan-300">Pilot-T</p>
            <p className="text-[11px] text-slate-500 mt-1">
              (Trainee Robotics Engineer)
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <ProfileStat label="Sessions with MechaMind" value="24" />
            <ProfileStat label="Concepts studied" value="18" />
            <ProfileStat label="Projects generated" value="5" />
            <ProfileStat label="Simulation drafts" value="3" />
          </div>

          {/* Focus Areas */}
          <div className="text-xs text-slate-300">
            <p className="font-semibold mb-1">Focus areas (planned)</p>
            <ul className="space-y-1">
              <li>• Robotics &amp; control systems</li>
              <li>• AI for perception and planning</li>
              <li>• Embedded systems and firmware</li>
            </ul>
          </div>

          {/* Memory preview (optional) */}
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="text-[11px] text-cyan-300 uppercase tracking-[0.14em] mb-2">
              MechaMind Memory
            </p>
            <p className="text-xs text-slate-400">
              Stored long-term notes about you (static preview — real memory
              shown via the API):
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
              <li>• You prefer step-by-step robotics explanations</li>
              <li>• Focus on mechanical + control engineering</li>
              <li>• Learning trajectory suggests fast improvement</li>
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE — Roadmap */}
        <div className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-cyan-200">
            Roadmap (Mock)
          </h2>

          <RoadmapItem
            status="In progress"
            progress={45}
            title="Solidify robotics fundamentals"
            detail="Finish kinematics, dynamics, and control basics."
          />

          <RoadmapItem
            status="Queued"
            progress={10}
            title="Build 2 intermediate hardware projects"
            detail="One wheeled robot + one robotic arm."
          />

          <RoadmapItem
            status="Planned"
            progress={0}
            title="Design a simulated warehouse robot"
            detail="Navigation, path planning, and obstacle avoidance."
          />

          <p className="text-[11px] text-slate-500 mt-1">
            Soon: MechaMind will auto-update this roadmap based on your real
            sessions, memory, and project completions.
          </p>
        </div>
      </section>
    </>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-600/70 bg-slate-950/60 px-3 py-3">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className="text-base font-semibold text-cyan-300">{value}</p>
    </div>
  );
}

function RoadmapItem({
  status,
  title,
  detail,
  progress,
}: {
  status: string;
  title: string;
  detail: string;
  progress: number;
}) {
  return (
    <div className="rounded-xl border border-slate-600/70 bg-slate-950/60 px-4 py-4 text-xs space-y-2">
      <p className="text-[11px] text-cyan-300 mb-1">{status}</p>

      <p className="font-semibold text-slate-100">{title}</p>
      <p className="text-[11px] text-slate-400">{detail}</p>

      {/* Progress Bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">Progress</span>
          <span className="text-[11px] font-medium text-cyan-300">
            {progress}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
