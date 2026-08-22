"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProgress } from "@/context/ProgressProvider";
import { getPracticeQuestions, getQuestionsForDailyPlan } from "@/lib/questionSelector";
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

  useEffect(() => {
    if (!isReady || sessionId) return;

    let selected: Question[] = [];

    if (mode === "daily" && day) {
      const plan = generateDailyPracticePlan(day, progress);
      if (plan) {
        selected = getQuestionsForDailyPlan(plan, progress);
      }
    } else {
      selected = getPracticeQuestions({
        mode,
        subjectId: subjectIdParam,
        topicId: topicIdParam,
        count,
        studentProgress: progress,
      });
    }

    const isSingleTopic = mode !== "daily" && mode !== "mock";
    const newSessionId = `session-${mode}-${topicIdParam ?? subjectIdParam ?? "mixed"}-${Date.now()}`;

    startSession({
      id: newSessionId,
      mode,
      subjectId: isSingleTopic ? subjectIdParam : undefined,
      topicId: isSingleTopic ? topicIdParam : undefined,
      questionIds: selected.map((q) => q.id),
    });

    // One-time session setup once progress has loaded from storage; guarded
    // by the `sessionId` check above so it can never re-run for this mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(selected);
    setSessionId(newSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  if (!isReady || !sessionId) {
    return <p className="text-center text-slate-500">Loading your practice session…</p>;
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-800">
        <p className="font-semibold">No questions available for this selection yet.</p>
        <Link href="/subjects" className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
          Back to subjects
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[index];
  const isLastQuestion = index === questions.length - 1;

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

  function handleNext() {
    if (!isLastQuestion) {
      setIndex((i) => i + 1);
      setSelectedOptionId(undefined);
      setRevealed(false);
      return;
    }

    completeSession(sessionId!, correctCount);
    if (mode === "daily" && day) markDailyComplete(day);
    router.push(`/results/${sessionId}`);
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
        <button
          type="button"
          onClick={handleNext}
          className="min-h-[4rem] w-full rounded-2xl bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition active:bg-indigo-800 sm:hover:bg-indigo-700"
        >
          {isLastQuestion ? "Finish" : "Next Question"}
        </button>
      )}
    </div>
  );
}
