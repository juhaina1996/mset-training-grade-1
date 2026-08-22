"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/context/ProgressProvider";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { activeProfile, progress } = useProgress();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    // One-time hydration-safe read of every profile's progress from
    // localStorage — recomputed whenever the active profile's own progress
    // changes, so a fresh answer updates their rank immediately.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getLeaderboard());
  }, [progress]);

  if (!entries) {
    return <p className="text-center text-slate-500">Loading rank list…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Rank List</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ranked by total correct answers on this device.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No players yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, index) => {
            const isActive = entry.profile.id === activeProfile?.id;
            return (
              <div
                key={entry.profile.id}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm transition ${
                  isActive
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <span className="w-10 shrink-0 text-center text-2xl font-bold text-slate-500 dark:text-slate-400">
                  {RANK_ICONS[index] ?? `#${index + 1}`}
                </span>
                <span className="text-4xl">{entry.profile.avatar}</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {entry.profile.name}
                    {isActive && <span className="ml-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">(You)</span>}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {entry.totalAttempted} questions · {entry.accuracy}% correct · {entry.daysCompleted} days practiced
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {entry.totalCorrect}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">correct</p>
                </div>
                {entry.streak > 0 && (
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 sm:flex dark:bg-amber-900/40 dark:text-amber-300">
                    🔥 {entry.streak}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
