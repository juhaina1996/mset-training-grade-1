"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { examConfig } from "@/config/exam";
import { useProgress } from "@/context/ProgressProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/mock-exam", label: "Mock Exam" },
  { href: "/leaderboard", label: "Rank List" },
];

export function Header() {
  const pathname = usePathname();
  const { progress, isReady, activeProfile, logout } = useProgress();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-indigo-700 dark:text-indigo-400">
          <span className="text-3xl">🎓</span>
          <span className="hidden sm:inline">{examConfig.shortName} Practice</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[2.75rem] items-center rounded-xl px-4 py-2 text-base font-semibold transition ${
                pathname === item.href
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                  : "text-slate-500 active:bg-slate-100 sm:hover:text-indigo-600 dark:text-slate-400 dark:sm:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isReady && (
            <span className="flex min-h-[2.75rem] items-center gap-1 rounded-full bg-amber-100 px-4 py-2 text-base font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              🔥 {progress.streak}
            </span>
          )}
          {activeProfile && (
            <button
              type="button"
              onClick={logout}
              title="Switch player"
              className="flex min-h-[2.75rem] items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 transition active:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="text-2xl">{activeProfile.avatar}</span>
              <span className="hidden sm:inline">{activeProfile.name}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
