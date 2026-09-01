import Link from "next/link";

export function MistakesCard({ mistakeCount }: { mistakeCount: number }) {
  if (mistakeCount === 0) return null;

  return (
    <section className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-rose-900/50 dark:bg-rose-950/20">
      <div>
        <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
          Practice your mistakes ({mistakeCount})
        </h2>
        <p className="text-sm text-rose-800/80 dark:text-rose-300/80">
          Go through every question you&apos;ve gotten wrong so far, one by one.
        </p>
      </div>
      <Link
        href="/practice?mode=mistakes"
        className="flex min-h-[3rem] w-full shrink-0 items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-base font-bold text-white transition active:bg-rose-800 sm:w-auto sm:hover:bg-rose-700"
      >
        Start
      </Link>
    </section>
  );
}
