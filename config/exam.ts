export const examConfig = {
  name: "Malabar Sahodaya Excellence Test",
  shortName: "MSET",
  grade: 1,
  preparationStartDate: "2026-08-22",
  examDate: "2026-09-26",
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

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(fromISO + "T00:00:00");
  const to = new Date(toISO + "T00:00:00");
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

export function isPreparationStarted(today: Date = new Date()): boolean {
  return today.toISOString().slice(0, 10) >= examConfig.preparationStartDate;
}

export function isExamFinished(today: Date = new Date()): boolean {
  return today.toISOString().slice(0, 10) > examConfig.examDate;
}

export function isExamDay(today: Date = new Date()): boolean {
  return today.toISOString().slice(0, 10) === examConfig.examDate;
}

export function daysUntilExam(today: Date = new Date()): number {
  const todayISO = today.toISOString().slice(0, 10);
  return daysBetween(todayISO, examConfig.examDate);
}

export function preparationDay(today: Date = new Date()): number {
  const todayISO = today.toISOString().slice(0, 10);
  if (todayISO < examConfig.preparationStartDate) return 0;
  return daysBetween(examConfig.preparationStartDate, todayISO) + 1;
}

export function totalPreparationDays(): number {
  return daysBetween(examConfig.preparationStartDate, examConfig.examDate) + 1;
}
