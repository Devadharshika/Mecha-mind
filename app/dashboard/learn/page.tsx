"use client";

type Lesson = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  status: "Locked" | "In Progress" | "Completed" | "Available";
};

type Track = {
  id: string;
  name: string;
  focus: string;
  level: string;
  progress: number;
  estimated: string;
};

const tracks: Track[] = [
  {
    id: "fundamentals",
    name: "Robotics Fundamentals",
    focus: "Kinematics, frames, basic dynamics, and coordinate transforms.",
    level: "Beginner → Intermediate",
    progress: 45,
    estimated: "6–8 hours remaining",
  },
  {
    id: "control",
    name: "Control & Motion",
    focus: "PID control, trajectories, stability, and tuning strategies.",
    level: "Intermediate",
    progress: 20,
    estimated: "8–10 hours remaining",
  },
  {
    id: "software",
    name: "Robotics Software & ROS",
    focus: "ROS basics, topics, TF, URDF, and simple navigation stacks.",
    level: "Intermediate → Advanced",
    progress: 10,
    estimated: "10+ hours remaining",
  },
];

const lessons: Lesson[] = [
  {
    id: "frames",
    title: "Reference Frames & Transformations",
    level: "Beginner",
    duration: "25 min",
    status: "In Progress",
  },
  {
    id: "fk",
    title: "Forward Kinematics for a 2-DOF Arm",
    level: "Beginner",
    duration: "30 min",
    status: "Available",
  },
  {
    id: "pid-basics",
    title: "PID Control Intuition",
    level: "Intermediate",
    duration: "35 min",
    status: "Available",
  },
  {
    id: "ros-intro",
    title: "Getting Started with ROS Nodes & Topics",
    level: "Intermediate",
    duration: "40 min",
    status: "Locked",
  },
];

export default function LearnPage() {
  return (
    <>
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
            Learning Deck
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">
            Robotics <span className="text-cyan-300">Learning Path</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
            This is your curated path to becoming a robotics engineer. Progress
            through tracks, complete missions, and use the AI Console whenever
            you want deeper explanations.
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          <p>Mode</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Guided Track • Active
          </p>
        </div>
      </header>

      {/* Tracks + current module */}
      <section className="grid gap-6 lg:grid-cols-[3fr,2fr] mb-6">
        {/* Track overview */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/60 px-5 py-5 shadow-lg shadow-cyan-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Learning Tracks
            </h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Designed for robotics & control
            </span>
          </div>

          <div className="space-y-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-2xl border border-slate-700/70 bg-slate-950/80 px-4 py-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
                      Track
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {track.name}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {track.focus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Level</p>
                    <p className="text-[11px] font-medium text-cyan-200">
                      {track.level}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {track.estimated}
                    </p>
                  </div>
                </div>

                {/* progress bar */}
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Track Progress</span>
                    <span className="text-cyan-300 font-medium">
                      {track.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                      style={{ width: `${track.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex gap-2 text-[11px]">
                  <a
                    href="/dashboard/chat"
                    className="inline-flex items-center justify-center rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-3 py-1 font-medium text-cyan-100 hover:bg-cyan-500/20 transition"
                  >
                    Ask MechaMind about this track
                  </a>
                  <button className="inline-flex items-center justify-center rounded-xl border border-slate-600/60 px-3 py-1 text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition">
                    View syllabus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current mission / lesson queue */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/80 via-slate-950 to-slate-900 px-5 py-5 shadow-lg shadow-cyan-900/40">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Current Mission
            </h2>
            <button className="text-[11px] rounded-full border border-cyan-500/40 px-3 py-1 text-cyan-200 hover:bg-cyan-500/10 transition">
              Start focused session
            </button>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 mb-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
              Now Playing
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              Reference Frames & Transformations
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Learn how to move between robot, world, and camera frames using
              rotation matrices and homogeneous transforms.
            </p>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Estimated: 25 minutes</span>
              <span>Track: Robotics Fundamentals</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mb-2">
            Next up in your queue:
          </p>

          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-100">
                    {lesson.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {lesson.level} • {lesson.duration}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={[
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      lesson.status === "Completed"
                        ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                        : lesson.status === "In Progress"
                        ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                        : lesson.status === "Locked"
                        ? "border-slate-600/80 bg-slate-800 text-slate-400"
                        : "border-amber-400/60 bg-amber-500/10 text-amber-200",
                    ].join(" ")}
                  >
                    {lesson.status}
                  </span>
                  <button className="text-[10px] rounded-full border border-slate-600/70 px-2 py-0.5 text-slate-300 hover:border-cyan-400 hover:text-cyan-200 transition">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer tip */}
      <p className="mt-4 text-[11px] text-slate-500">
        Hint: When a topic feels hard, jump to the{" "}
        <a href="/dashboard/chat" className="text-cyan-300 underline">
          MechaMind AI Console
        </a>{" "}
        and ask for a step-by-step breakdown, derivation, or code example.
      </p>
    </>
  );
}
