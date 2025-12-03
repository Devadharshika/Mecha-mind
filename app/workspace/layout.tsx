import Link from "next/link";
import { ReactNode } from "react";
import { Bot, ArrowLeft, Activity } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar – no sidebar in workspace */}
      <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 md:px-8 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-cyan-500/15 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.45)]">
              <span className="text-xs font-semibold tracking-tight text-cyan-100">
                MM
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm md:text-base font-semibold text-slate-50">
                MechaMind AI
              </span>
              <span className="text-[10px] md:text-xs text-slate-400">
                Robotics Workspace
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] md:text-xs text-slate-400 pl-4 border-l border-slate-800">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Focused environment for building & simulating robots.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] md:text-xs">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-emerald-200 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Workspace ready
            </span>
          </div>

          {/* Exit back to dashboard */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-slate-200 hover:border-cyan-400 hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit workspace
          </Link>
        </div>
      </header>

      {/* Fullscreen content */}
      <main className="flex-1 px-4 md:px-8 py-4 md:py-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
