export const examConfig = {
  name: "Malabar Sahodaya Excellence Test",
  shortName: "MSET",
  grade: 1,
  preparationStartDate: "2026-08-22",
  examDate: "2026-11-21",
  subjects: ["maths", "english", "evs", "gk", "aptitude"],
} as const;

// The three subjects on the official Grade 1 & 2 syllabus. Mock exams are
// built only from these, weighted evenly; English/EVS are bonus subjects
// outside the official syllabus and are excluded from the mock exam.
export const mockExamConfig = {
  subjectIds: ["maths", "gk", "aptitude"],
  totalQuestions: 50,
  timeLimitMinutes: 45,
} as const;

/**
 * The calendar date where the student actually is, as YYYY-MM-DD. Going via
 * `Date#toISOString` converts to UTC first, which in timezones ahead of UTC
 * reports yesterday's date during the early hours of the morning — so the
 * day counter and countdown would roll over hours late.
 */
export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function isPreparationStarted(today: Date = new Date()): boolean {
  return toLocalISODate(today) >= examConfig.preparationStartDate;
}

export function isExamFinished(today: Date = new Date()): boolean {
  return toLocalISODate(today) > examConfig.examDate;
}

export function isExamDay(today: Date = new Date()): boolean {
  return toLocalISODate(today) === examConfig.examDate;
}

export function daysUntilExam(today: Date = new Date()): number {
  const todayISO = toLocalISODate(today);
  return daysBetween(todayISO, examConfig.examDate);
}

export function preparationDay(today: Date = new Date()): number {
  const todayISO = toLocalISODate(today);
  if (todayISO < examConfig.preparationStartDate) return 0;
  return daysBetween(examConfig.preparationStartDate, todayISO) + 1;
}

export function totalPreparationDays(): number {
  return daysBetween(examConfig.preparationStartDate, examConfig.examDate) + 1;
}
