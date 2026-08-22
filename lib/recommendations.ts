import type { StudentProgress, Topic, TopicProgress } from "@/types";
import { getAllTopics, getTopicById } from "@/data/topics";

const WEAK_ACCURACY_THRESHOLD = 65;
const STRONG_ACCURACY_THRESHOLD = 85;
const MIN_ATTEMPTS_FOR_SIGNAL = 3;

function topicsWithProgress(studentProgress: StudentProgress): Array<{ topic: Topic; progress: TopicProgress }> {
  return Object.values(studentProgress.topicProgress)
    .filter((progress) => progress.questionsAttempted >= MIN_ATTEMPTS_FOR_SIGNAL)
    .map((progress) => ({ topic: getTopicById(progress.topicId), progress }))
    .filter((entry): entry is { topic: Topic; progress: TopicProgress } => Boolean(entry.topic));
}

export function getWeakTopics(studentProgress: StudentProgress): Topic[] {
  return topicsWithProgress(studentProgress)
    .filter(({ progress }) => progress.accuracy < WEAK_ACCURACY_THRESHOLD)
    .sort((a, b) => a.progress.accuracy - b.progress.accuracy)
    .map(({ topic }) => topic);
}

export function getStrongTopics(studentProgress: StudentProgress): Topic[] {
  return topicsWithProgress(studentProgress)
    .filter(({ progress }) => progress.accuracy >= STRONG_ACCURACY_THRESHOLD)
    .sort((a, b) => b.progress.accuracy - a.progress.accuracy)
    .map(({ topic }) => topic);
}

export function getTopicsForRevision(studentProgress: StudentProgress): Topic[] {
  return topicsWithProgress(studentProgress)
    .filter(({ progress }) => progress.accuracy < STRONG_ACCURACY_THRESHOLD)
    .sort((a, b) => a.progress.accuracy - b.progress.accuracy)
    .map(({ topic }) => topic);
}

export function getRecommendedTopics(studentProgress: StudentProgress, limit: number = 3): Topic[] {
  const practiced = topicsWithProgress(studentProgress);
  const practicedIds = new Set(practiced.map(({ topic }) => topic.id));

  const weakest = practiced
    .slice()
    .sort((a, b) => a.progress.accuracy - b.progress.accuracy)
    .map(({ topic }) => topic);

  const neverPracticed = getAllTopics().filter((topic) => !practicedIds.has(topic.id));

  return [...weakest, ...neverPracticed].slice(0, limit);
}

export function getRecommendedRetests(studentProgress: StudentProgress, limit: number = 3): Topic[] {
  return topicsWithProgress(studentProgress)
    .filter(({ progress }) => progress.accuracy < STRONG_ACCURACY_THRESHOLD)
    .sort((a, b) => a.progress.accuracy - b.progress.accuracy)
    .slice(0, limit)
    .map(({ topic }) => topic);
}
