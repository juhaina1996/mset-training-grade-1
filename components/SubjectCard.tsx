import Link from "next/link";
import type { Subject } from "@/types";
import { ProgressBar } from "@/components/ProgressBar";

export function SubjectCard({
  subject,
  averageAccuracy,
}: {
  subject: Subject;
  averageAccuracy?: number;
}) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{subject.icon}</span>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{subject.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{subject.description}</p>
        </div>
      </div>
      {typeof averageAccuracy === "number" && (
        <div className="mt-1 space-y-1">
          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{averageAccuracy}%</span>
          </div>
          <ProgressBar percentage={averageAccuracy} />
        </div>
      )}
    </Link>
  );
}
