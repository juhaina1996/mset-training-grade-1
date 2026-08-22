"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Difficulty, PracticeMode, Profile, QuestionAttempt, StudentProgress, TestSession } from "@/types";
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
import {
  createProfile as createProfileRepo,
  deleteProfile as deleteProfileRepo,
  getActiveProfileId,
  getAllProfiles,
  setActiveProfileId,
} from "@/lib/repositories/profileRepository";
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
  profiles: Profile[];
  activeProfile: Profile | null;
  createProfile: (name: string, avatar: string) => void;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  logout: () => void;
  recordAttempt: (input: NewAttemptInput, fallbackDifficulty?: Difficulty) => void;
  startSession: (input: NewSessionInput) => void;
  completeSession: (sessionId: string, correctAnswers: number) => void;
  markDailyComplete: (day: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StudentProgress>(getEmptyProgress());
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // One-time hydration-safe read of the external localStorage store: the
    // initial render must match the server (no profiles loaded yet), so the
    // real values can only be loaded after mount.
    const loadedProfiles = getAllProfiles();
    const activeId = getActiveProfileId();
    const active = activeId ? loadedProfiles.find((p) => p.id === activeId) ?? null : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfiles(loadedProfiles);
    setActiveProfile(active);
    if (active) setProgress(loadProgress(active.id));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && activeProfile) saveProgress(activeProfile.id, progress);
  }, [progress, isReady, activeProfile]);

  const applyAchievementCheck = useCallback((next: StudentProgress): StudentProgress => {
    const newlyUnlocked = getNewlyUnlockedAchievements(next);
    return newlyUnlocked.length > 0
      ? { ...next, achievements: Array.from(new Set([...next.achievements, ...newlyUnlocked])) }
      : next;
  }, []);

  const createProfile = useCallback((name: string, avatar: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const profile = createProfileRepo(trimmed, avatar);
    setActiveProfileId(profile.id);
    setProfiles((prev) => [...prev, profile]);
    setActiveProfile(profile);
    setProgress(getEmptyProgress());
  }, []);

  const switchProfile = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return;
      setActiveProfileId(profileId);
      setActiveProfile(profile);
      setProgress(loadProgress(profileId));
    },
    [profiles]
  );

  const deleteProfile = useCallback(
    (profileId: string) => {
      deleteProfileRepo(profileId);
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      if (activeProfile?.id === profileId) {
        setActiveProfile(null);
        setProgress(getEmptyProgress());
      }
    },
    [activeProfile]
  );

  const logout = useCallback(() => {
    setActiveProfileId(null);
    setActiveProfile(null);
    setProgress(getEmptyProgress());
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
    if (!activeProfile) return;
    setProgress(resetProgressRepo(activeProfile.id));
  }, [activeProfile]);

  const value = useMemo(
    () => ({
      progress,
      isReady,
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      deleteProfile,
      logout,
      recordAttempt,
      startSession,
      completeSession,
      markDailyComplete,
      reset,
    }),
    [
      progress,
      isReady,
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      deleteProfile,
      logout,
      recordAttempt,
      startSession,
      completeSession,
      markDailyComplete,
      reset,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
