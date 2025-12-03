// app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, ReactElement } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactElement;
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: <OverviewIcon /> },
    { label: "Learn", href: "/dashboard/learn", icon: <LearnIcon /> },
    { label: "AI Console", href: "/dashboard/chat", icon: <ConsoleIcon /> },
    { label: "Build Projects", href: "/dashboard/build", icon: <BuildIcon /> },
    { label: "Simulate Robots", href: "/dashboard/simulate", icon: <SimIcon /> },
    { label: "Profile & Progress", href: "/dashboard/profile", icon: <ProfileIcon /> },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/* Blueprint background */}
      <div className="fixed inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a33_1px,transparent_1px),linear-gradient(to_bottom,#0f172a33_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="flex h-screen">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-cyan-500/20 bg-black/40 px-6 py-6 flex flex-col overflow-y-auto">
          {/* Logo block */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-cyan-400/60 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.35)]">
              <span className="text-[14px] font-semibold tracking-[0.16em] text-cyan-100">
                MM
              </span>
            </div>

            <div>
              <h1 className="text-lg font-semibold text-cyan-300 tracking-wide">
                MechaMind AI
              </h1>
              <p className="text-[11px] text-slate-400">
                Engineering & Robotics Console
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-2 text-sm">
            {navItems.map((item) => {
              const isRoot = item.href === "/dashboard";

              // FIX: Overview ONLY active on exact /dashboard
              const isActive = isRoot
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2 transition border",
                    isActive
                      ? "bg-cyan-500/10 border-cyan-400/60 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.3)]"
                      : "border-transparent hover:bg-white/5 hover:border-cyan-500/30 text-slate-200",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/70 border transition-all",
                      isActive
                        ? "border-cyan-400/90 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                        : "border-slate-600/60 text-cyan-300 hover:border-cyan-500/50 hover:shadow-[0_0_8px_rgba(34,211,238,0.35)]",
                    ].join(" ")}
                  >
                    <span className="scale-[1.18]">{item.icon}</span>
                  </span>

                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* SETTINGS */}
            <button
              type="button"
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:border-cyan-500/30 border border-transparent transition"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/70 border border-slate-600/70 text-cyan-300 hover:border-cyan-500/50 hover:shadow-[0_0_8px_rgba(34,211,238,0.35)] transition-all">
                <span className="scale-[1.18]">
                  <SettingsIcon />
                </span>
              </span>
              Settings
            </button>
          </nav>

          {/* FOOTER */}
          <div className="mt-auto pt-6 border-t border-white/10 text-xs text-slate-500">
            Blueprint Build • v0.1
          </div>
        </aside>

        {/* MAIN VIEW */}
        <section className="flex-1 p-8 overflow-y-auto">{children}</section>
      </div>
    </main>
  );
}

/* ─────────────────────────────
   ICONS
───────────────────────────── */

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <rect x="3.5" y="5" width="7" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <rect x="13.5" y="5" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <rect x="3.5" y="14" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M13.5 14.5h7M13.5 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path d="M4 7.5 12 4l8 3.5-8 3.5L4 7.5Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M6 9v5.5c0 1.2.8 2.2 2 2.6L12 18l4-0.9c1.2-0.4 2-1.4 2-2.6V9" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function ConsoleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <rect x="4" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M7.5 11 9.8 9.5M7.5 11 9.8 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11.5 13.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BuildIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path d="M9.5 5.5 7 8l2.5 2.5 2.5-2.5-2.5-2.5Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M14.5 11.5 17 9l-2.5-2.5L12 9l2.5 2.5Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M7.5 14.5 10 17l6.5-6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SimIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M6.5 19c1.2-2.3 3.2-3.7 5.5-3.7s4.3 1.4 5.5 3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M4 8.5h2M18 8.5h2M12 3.5v2M8.2 4.2l-1 1.7M15.8 4.2l1 1.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M7 18.5c1.1-2 2.7-3 5-3s3.9 1 5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <rect x="5" y="4.5" width="14" height="15" rx="4" stroke="currentColor" strokeWidth="1.2" fill="none" className="opacity-60" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M5.5 10.5 4 9l1.5-2.5 2 .2.9-1.8L11 4l1 .9 1-.9 2.6.9.9 1.8 2-.2L20 9l-1.5 1.5.3 1.8L20 14l-1.1 2.4-2-.2-.9 1.8L13 19l-1-.9-1 .9-2.6-.9-.9-1.8-2 .2L4 14l1.7-1.7.3-1.8Z" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  );
}
