"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  daysUntilExam,
  examConfig,
  isExamFinished,
  isPreparationStarted,
  preparationDay,
  totalPreparationDays,
} from "@/config/exam";
import { useProgress } from "@/context/ProgressProvider";
import { generateDailyPracticePlan } from "@/lib/dailyPlanGenerator";
import { getRecommendedTopics } from "@/lib/recommendations";
import { getAllAchievements } from "@/data/achievements";
import { DailyPlanCard } from "@/components/DailyPlanCard";
import { TopicCard } from "@/components/TopicCard";

export default function Home() {
  const { progress, isReady } = useProgress();
  const today = useMemo(() => new Date(), []);

  const day = preparationDay(today);
  const plan = day >= 1 ? generateDailyPracticePlan(day, progress) : undefined;
  const recommendedTopics = isReady ? getRecommendedTopics(progress, 3) : [];
  const achievements = getAllAchievements().filter((a) => progress.achievements.includes(a.id));

  if (!isPreparationStarted(today)) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <p className="text-lg font-semibold">
          {examConfig.shortName} preparation begins on {examConfig.preparationStartDate}.
        </p>
      </div>
    );
  }

  if (isExamFinished(today)) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <p className="text-lg font-semibold">🎉 The {examConfig.shortName} preparation window has ended. Great work!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
          Welcome back!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Day {day} of {totalPreparationDays()} · {daysUntilExam(today)} days until the {examConfig.shortName}
        </p>
      </div>

      {plan ? (
        <DailyPlanCard plan={plan} alreadyCompleted={progress.completedDailySessions.includes(`day-${day}`)} />
      ) : (
        <p>No plan found for today.</p>
      )}

      {recommendedTopics.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Recommended for you</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} progress={progress.topicProgress[topic.id]} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Your achievements</h2>
          <Link href="/subjects" className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Browse all subjects →
          </Link>
        </div>
        {achievements.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete a practice session to earn your first achievement!
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                title={achievement.description}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{achievement.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
