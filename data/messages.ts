import type { Message } from "@/types";

export const messages: Message[] = [
  { id: "enc-1", category: "encouragement", text: "You're doing great — keep going!" },
  { id: "enc-2", category: "encouragement", text: "Every question makes you smarter!" },
  { id: "enc-3", category: "encouragement", text: "Believe in yourself, you've got this!" },
  { id: "enc-4", category: "encouragement", text: "Practice makes progress!" },
  { id: "streak-1", category: "streak", text: "You're on a streak! Don't stop now!" },
  { id: "streak-2", category: "streak", text: "Amazing consistency — keep the streak alive!" },
  { id: "milestone-1", category: "milestone", text: "Wow, look how far you've come!" },
  { id: "milestone-2", category: "milestone", text: "You just unlocked a new achievement!" },
  { id: "correct-1", category: "correct", text: "Correct! Great job!" },
  { id: "correct-2", category: "correct", text: "That's right, well done!" },
  { id: "correct-3", category: "correct", text: "Awesome! You got it!" },
  { id: "incorrect-1", category: "incorrect", text: "Not quite — let's learn from this one." },
  { id: "incorrect-2", category: "incorrect", text: "Close! Check the explanation below." },
  { id: "incorrect-3", category: "incorrect", text: "That's okay, mistakes help us learn!" },
];

export function getMessagesByCategory(category: Message["category"]): Message[] {
  return messages.filter((m) => m.category === category);
}

export function getRandomMessage(category: Message["category"]): Message {
  const pool = getMessagesByCategory(category);
  return pool[Math.floor(Math.random() * pool.length)];
}
