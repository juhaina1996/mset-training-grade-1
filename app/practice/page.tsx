"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/context/ProgressProvider";
import { getMistakeQuestions, getPracticeQuestions, getQuestionsForDailyPlan } from "@/lib/questionSelector";
import { getQuestionById } from "@/lib/repositories/questionRepository";
import { generateDailyPracticePlan } from "@/lib/dailyPlanGenerator";
import { QuestionCard } from "@/components/QuestionCard";
import { ProgressBar } from "@/components/ProgressBar";
import type { PracticeMode, Question } from "@/types";

export default function PracticePage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-500">Loading your practice session…</p>}>
      <PracticeContent />
    </Suspense>
  );
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress, isReady, startSession, recordAttempt, completeSession, markDailyComplete } =
    useProgress();

  const mode = (searchParams.get("mode") ?? "daily") as PracticeMode;
  const subjectIdParam = searchParams.get("subjectId") ?? undefined;
  const topicIdParam = searchParams.get("topicId") ?? undefined;
  const count = Number(searchParams.get("count") ?? 10) || 10;
  const day = searchParams.get("day") ? Number(searchParams.get("day")) : undefined;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  const isDailyFullSession = mode === "daily" && day !== undefined;
  const currentQuestion = questions[index];
  const isLastQuestion = index === questions.length - 1;

  useEffect(() => {
    if (!isReady || sessionId) return;

    let selected: Question[] = [];
    let newSessionId: string;
    let resumedIndex = 0;
    let resumedCorrect = 0;
    let resumedSelectedOptionId: string | undefined;
    let resumedRevealed = false;

    if (isDailyFullSession) {
      // Deterministic per-day session id so returning to an unfinished day's
      // 100-question set resumes it instead of starting over from question 1.
      const baseSessionId = `session-daily-day-${day}`;
      const existingSession = progress.testSessions.find((s) => s.id === baseSessionId);

      if (existingSession && !existingSession.completedAt) {
        newSessionId = existingSession.id;
        selected = existingSession.questionIds
          .map((id) => getQuestionById(id))
          .filter((q): q is Question => Boolean(q));

        const attemptsForSession = progress.questionAttempts.filter((a) => a.sessionId === newSessionId);
        const answeredIds = new Set(attemptsForSession.map((a) => a.questionId));
        const firstUnanswered = selected.findIndex((q) => !answeredIds.has(q.id));
        resumedIndex = firstUnanswered === -1 ? Math.max(selected.length - 1, 0) : firstUnanswered;
        resumedCorrect = attemptsForSession.filter((a) => a.isCorrect).length;

        const currentAttempt = attemptsForSession.find((a) => a.questionId === selected[resumedIndex]?.id);
        if (currentAttempt) {
          resumedSelectedOptionId = currentAttempt.selectedOptionId;
          resumedRevealed = true;
        }
      } else {
        const plan = generateDailyPracticePlan(day!, progress);
        selected = plan ? getQuestionsForDailyPlan(plan, progress) : [];
        newSessionId = existingSession
          ? `${baseSessionId}-r${
              progress.testSessions.filter(
                (s) => s.id === baseSessionId || s.id.startsWith(`${baseSessionId}-r`)
              ).length
            }`
          : baseSessionId;

        startSession({
          id: newSessionId,
          mode,
          questionIds: selected.map((q) => q.id),
        });
      }
    } else if (mode === "mistakes") {
      // Review mode has no natural default size — show every outstanding
      // mistake unless the caller explicitly capped it via ?count=.
      const mistakes = getMistakeQuestions(progress);
      selected = searchParams.get("count") ? mistakes.slice(0, count) : mistakes;
      newSessionId = `session-mistakes-${Date.now()}`;

      startSession({
        id: newSessionId,
        mode,
        questionIds: selected.map((q) => q.id),
      });
    } else {
      selected = getPracticeQuestions({
        mode,
        subjectId: subjectIdParam,
        topicId: topicIdParam,
        count,
        studentProgress: progress,
      });

      const isSingleTopic = mode !== "daily" && mode !== "mock";
      newSessionId = `session-${mode}-${topicIdParam ?? subjectIdParam ?? "mixed"}-${Date.now()}`;

      startSession({
        id: newSessionId,
        mode,
        subjectId: isSingleTopic ? subjectIdParam : undefined,
        topicId: isSingleTopic ? topicIdParam : undefined,
        questionIds: selected.map((q) => q.id),
      });
    }

    // One-time session setup once progress has loaded from storage; guarded
    // by the `sessionId` check above so it can never re-run for this mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(selected);
    setSessionId(newSessionId);
    setIndex(resumedIndex);
    setCorrectCount(resumedCorrect);
    setSelectedOptionId(resumedSelectedOptionId);
    setRevealed(resumedRevealed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  useEffect(() => {
    if (!revealed) return;

    const timeout = window.setTimeout(() => {
      if (!isLastQuestion) {
        setIndex((i) => i + 1);
        setSelectedOptionId(undefined);
        setRevealed(false);
        return;
      }

      completeSession(sessionId!, correctCount);

      if (isDailyFullSession) {
        markDailyComplete(day!);
        setShowCongrats(true);
        window.setTimeout(() => router.push("/"), 2500);
        return;
      }

      router.push(`/results/${sessionId}`);
    }, 1500);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  if (!isReady || !sessionId) {
    return <p className="text-center text-slate-500">Loading your practice session…</p>;
  }

  if (questions.length === 0) {
    const isMistakesMode = mode === "mistakes";
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <p className="font-semibold">
          {isMistakesMode
            ? "No mistakes to review right now — great job!"
            : "No questions available for this selection yet."}
        </p>
        <Link
          href={isMistakesMode ? "/" : "/subjects"}
          className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {isMistakesMode ? "Back to home" : "Back to subjects"}
        </Link>
      </div>
    );
  }

  if (showCongrats) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-800">
        <span className="text-5xl">🎉</span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
          Congratulations! You finished all {questions.length} questions!
        </h1>
        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
          {correctCount} out of {questions.length} correct ({percentage}%)
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Taking you back to home…</p>
        <Link
          href="/"
          className="mt-2 flex min-h-[3.25rem] items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg font-bold text-white transition active:bg-indigo-800 sm:hover:bg-indigo-700"
        >
          Back to Home Now
        </Link>
      </div>
    );
  }

  function handleSelect(optionId: string) {
    if (revealed) return;
    const isCorrect = optionId === currentQuestion.correctOptionId;
    setSelectedOptionId(optionId);
    setRevealed(true);
    if (isCorrect) setCorrectCount((c) => c + 1);

    recordAttempt(
      {
        questionId: currentQuestion.id,
        subjectId: currentQuestion.subjectId,
        topicId: currentQuestion.topicId,
        selectedOptionId: optionId,
        isCorrect,
        sessionId: sessionId!,
      },
      currentQuestion.difficulty
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between text-base font-semibold text-slate-500 dark:text-slate-400">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span className="capitalize">{mode} practice</span>
      </div>
      <ProgressBar percentage={((index + (revealed ? 1 : 0)) / questions.length) * 100} />

      <QuestionCard
        question={currentQuestion}
        selectedOptionId={selectedOptionId}
        revealed={revealed}
        onSelect={handleSelect}
      />

      {revealed && (
        <p className="text-center text-base font-semibold text-slate-500 dark:text-slate-400">
          {isLastQuestion ? "Finishing up…" : "Next question…"}
        </p>
      )}
    </div>
  );
}
