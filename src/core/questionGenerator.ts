import { Question, QuestionType } from './types';
import { OBJECT_EMOJIS } from './config';

function generateUniqueId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateDistractors(correct: number, min: number, max: number, count: number = 2): number[] {
  const distractors = new Set<number>();

  // Add nearby values as distractors
  if (correct > min) distractors.add(correct - 1);
  if (correct < max) distractors.add(correct + 1);

  // Add random distractors
  while (distractors.size < count) {
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    if (value !== correct) {
      distractors.add(value);
    }
  }

  return Array.from(distractors).slice(0, count);
}

export function generateCountingQuestion(maxCount: number = 5): Question {
  const count = Math.floor(Math.random() * maxCount) + 1;
  const emoji = getRandomElement(OBJECT_EMOJIS.counting);

  const distractors = generateDistractors(count, 0, maxCount + 2, 2);
  const choices = [count, ...distractors].sort(() => Math.random() - 0.5);

  return {
    id: generateUniqueId(),
    type: 'counting',
    promptText: `How many ${emoji}?`,
    objects: {
      groupA: {
        emoji,
        count,
      },
    },
    correctAnswer: count,
    choices,
  };
}

export function generateAdditionQuestion(maxSum: number = 5): Question {
  // Generate two numbers that sum to maxSum or less
  const sum = Math.floor(Math.random() * (maxSum - 1)) + 2; // Sum between 2 and maxSum
  const a = Math.floor(Math.random() * (sum - 1)) + 1; // At least 1
  const b = sum - a;

  const emojiA = getRandomElement(OBJECT_EMOJIS.addition);
  const emojiB = emojiA; // Use same emoji for both groups for clarity

  const distractors = generateDistractors(sum, 0, maxSum + 2, 2);
  const choices = [sum, ...distractors].sort(() => Math.random() - 0.5);

  return {
    id: generateUniqueId(),
    type: 'addition',
    promptText: `${a} + ${b} = ?`,
    objects: {
      groupA: {
        emoji: emojiA,
        count: a,
      },
      groupB: {
        emoji: emojiB,
        count: b,
      },
    },
    correctAnswer: sum,
    choices,
  };
}

export function generateQuestion(type: QuestionType, difficulty: number = 1): Question {
  if (type === 'counting') {
    const maxCount = difficulty <= 1 ? 5 : 10;
    return generateCountingQuestion(maxCount);
  } else {
    const maxSum = difficulty <= 1 ? 5 : 10;
    return generateAdditionQuestion(maxSum);
  }
}