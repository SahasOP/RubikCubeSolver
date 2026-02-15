// src/types/learning.ts
// Types and interfaces for the learning platform

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type AlgorithmCategory = 
  | "basic-moves"
  | "notation"
  | "cross"
  | "f2l"
  | "oll"
  | "pll"
  | "cmll"
  | "last-layer"
  | "advanced";

export interface Algorithm {
  id: string;
  name: string;
  algorithm: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;
  tips?: string[];
  setupMoves?: string;
  recognitionTips?: string;
  imageUrl?: string;
  averageMoves?: number;
  alternatives?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;
  duration: string;
  content: LessonContent[];
  algorithms: Algorithm[];
  quiz?: QuizQuestion[];
}

export interface LessonContent {
  type: "text" | "video" | "interactive" | "algorithm";
  title?: string;
  content: string;
  algorithm?: string;
  notes?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  completedLessons: string[];
  masteredAlgorithms: string[];
  practiceHistory: PracticeSession[];
  currentLevel: DifficultyLevel;
}

export interface PracticeSession {
  algorithmId: string;
  timestamp: number;
  success: boolean;
  timeSpent: number;
}