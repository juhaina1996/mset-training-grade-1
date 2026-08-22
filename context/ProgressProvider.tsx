"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Difficulty, PracticeMode, QuestionAttempt, StudentProgress, TestSession } from "@/types";
import {
  completeTestSession,
  getEmptyProgress,
  loadProgress,
  markDailySessionComplete,
  recordQuestionAttempt,
  resetProgress as resetProgressRepo,
  saveProgress,
  startTestSession,
} from "@/lib/repositories/progressRepository";
import { getNewlyUnlockedAchievements } from "@/lib/achievementEngine";

type NewAttemptInput = {
  questionId: string;
  subjectId: string;
  topicId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  sessionId: string;
  timeTakenSeconds?: number;
};

type NewSessionInput = {
  id: string;
  mode: PracticeMode;
  subjectId?: string;
  topicId?: string;
  questionIds: string[];
};

type ProgressContextValue = {
  progress: StudentProgress;
  isReady: boolean;
  recordAttempt: (input: NewAttemptInput, fallbackDifficulty?: Difficulty) => void;
  startSession: (input: NewSessionInput) => void;
  completeSession: (sessionId: string, correctAnswers: number) => void;
  markDailyComplete: (day: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StudentProgress>(getEmptyProgress());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // One-time hydration-safe read of the external localStorage store: the
    // initial render must match the server (empty progress), so the real
    // value can only be loaded after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(loadProgress());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) saveProgress(progress);
  }, [progress, isReady]);

  const applyAchievementCheck = useCallback((next: StudentProgress): StudentProgress => {
    const newlyUnlocked = getNewlyUnlockedAchievements(next);
    return newlyUnlocked.length > 0
      ? { ...next, achievements: Array.from(new Set([...next.achievements, ...newlyUnlocked])) }
      : next;
  }, []);

  const recordAttempt = useCallback(
    (input: NewAttemptInput, fallbackDifficulty: Difficulty = "easy") => {
      setProgress((prev) => {
        const attemptNumber =
          prev.questionAttempts.filter((a) => a.questionId === input.questionId).length + 1;
        const attempt: QuestionAttempt = {
          id: `attempt-${input.sessionId}-${input.questionId}-${attemptNumber}`,
          attemptedAt: new Date().toISOString(),
          attemptNumber,
          ...input,
        };
        return applyAchievementCheck(recordQuestionAttempt(prev, attempt, fallbackDifficulty));
      });
    },
    [applyAchievementCheck]
  );

  const startSession = useCallback((input: NewSessionInput) => {
    setProgress((prev) => {
      const session: TestSession = {
        ...input,
        startedAt: new Date().toISOString(),
        totalQuestions: input.questionIds.length,
      };
      return startTestSession(prev, session);
    });
  }, []);

  const completeSession = useCallback(
    (sessionId: string, correctAnswers: number) => {
      setProgress((prev) =>
        applyAchievementCheck(
          completeTestSession(prev, sessionId, {
            correctAnswers,
            completedAt: new Date().toISOString(),
          })
        )
      );
    },
    [applyAchievementCheck]
  );

  const markDailyComplete = useCallback(
    (day: number) => {
      const today = new Date().toISOString().slice(0, 10);
      setProgress((prev) => applyAchievementCheck(markDailySessionComplete(prev, `day-${day}`, today)));
    },
    [applyAchievementCheck]
  );

  const reset = useCallback(() => {
    setProgress(resetProgressRepo());
  }, []);

  const value = useMemo(
    () => ({ progress, isReady, recordAttempt, startSession, completeSession, markDailyComplete, reset }),
    [progress, isReady, recordAttempt, startSession, completeSession, markDailyComplete, reset]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
