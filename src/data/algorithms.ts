// src/data/algorithms.ts
// Comprehensive database of Rubik's Cube algorithms

import { Algorithm, Lesson } from "../types/learning";

export const ALGORITHMS: Algorithm[] = [
  // Basic Moves
  {
    id: "basic-r",
    name: "R (Right)",
    algorithm: "R",
    category: "basic-moves",
    difficulty: "beginner",
    description: "Turn the right face 90° clockwise",
    tips: ["Use your right index finger", "Keep the cube stable with your left hand"],
  },
  {
    id: "basic-r-prime",
    name: "R' (Right Inverse)",
    algorithm: "R'",
    category: "basic-moves",
    difficulty: "beginner",
    description: "Turn the right face 90° counter-clockwise",
    tips: ["Pull with your right index finger", "Opposite of R move"],
  },
  {
    id: "basic-u",
    name: "U (Up)",
    algorithm: "U",
    category: "basic-moves",
    difficulty: "beginner",
    description: "Turn the top face 90° clockwise",
    tips: ["Use both index fingers", "Most common move in speedcubing"],
  },
  {
    id: "basic-f",
    name: "F (Front)",
    algorithm: "F",
    category: "basic-moves",
    difficulty: "beginner",
    description: "Turn the front face 90° clockwise",
    tips: ["Use your right index finger", "Push the layer away from you"],
  },

  // Cross Algorithms
  {
    id: "cross-basic",
    name: "Basic Cross Pattern",
    algorithm: "F R' F' R",
    category: "cross",
    difficulty: "beginner",
    description: "Simple cross edge manipulation",
    tips: ["Practice until this becomes muscle memory", "Look for efficient cross solutions"],
  },

  // F2L (First Two Layers)
  {
    id: "f2l-basic-1",
    name: "Basic F2L Case 1",
    algorithm: "U R U' R'",
    category: "f2l",
    difficulty: "intermediate",
    description: "Corner and edge both in top layer, easy case",
    tips: ["Most intuitive F2L case", "Can be done from multiple angles"],
    averageMoves: 4,
  },
  {
    id: "f2l-basic-2",
    name: "Basic F2L Case 2",
    algorithm: "R U R' U' R U R'",
    category: "f2l",
    difficulty: "intermediate",
    description: "Corner in top, edge in middle",
    tips: ["Break and remake the pair", "Practice smooth execution"],
    averageMoves: 7,
  },
  {
    id: "f2l-basic-3",
    name: "Basic F2L Case 3",
    algorithm: "U' R U' R' U2 R U' R'",
    category: "f2l",
    difficulty: "intermediate",
    description: "Both pieces separated",
    tips: ["Setup move is crucial", "Watch the pairing"],
    averageMoves: 8,
  },

  // OLL (Orientation of Last Layer)
  {
    id: "oll-cross",
    name: "OLL Cross",
    algorithm: "F R U R' U' F'",
    category: "oll",
    difficulty: "intermediate",
    description: "Creates a cross on the top face",
    tips: ["One of the most important OLLs", "Very common pattern"],
    recognitionTips: "No edges oriented correctly",
    averageMoves: 6,
  },
  {
    id: "oll-dot",
    name: "OLL Dot",
    algorithm: "F R U R' U' F' f R U R' U' f'",
    category: "oll",
    difficulty: "intermediate",
    description: "From dot to cross pattern",
    tips: ["Combination of two triggers", "Practice the f and F distinction"],
    recognitionTips: "Center yellow, all edges wrong",
    averageMoves: 12,
  },
  {
    id: "oll-sune",
    name: "Sune",
    algorithm: "R U R' U R U2 R'",
    category: "oll",
    difficulty: "intermediate",
    description: "Very common OLL case",
    tips: ["Fastest OLL algorithm", "Learn this first!"],
    recognitionTips: "Yellow in the back-left corner pointing left",
    averageMoves: 7,
    alternatives: ["R U R' U R U2 R'", "L' U' L U' L' U2 L"],
  },
  {
    id: "oll-antisune",
    name: "Anti-Sune",
    algorithm: "R U2 R' U' R U' R'",
    category: "oll",
    difficulty: "intermediate",
    description: "Mirror of Sune",
    tips: ["Mirror of Sune", "Also very fast"],
    recognitionTips: "Yellow in the back-right corner pointing right",
    averageMoves: 7,
  },
  {
    id: "oll-headlights",
    name: "Headlights",
    algorithm: "F R U R' U' F'",
    category: "oll",
    difficulty: "intermediate",
    description: "Two adjacent oriented edges",
    tips: ["Same as OLL cross", "Very ergonomic"],
    averageMoves: 6,
  },
  {
    id: "oll-bowtie",
    name: "Bowtie",
    algorithm: "F' r U R' U' r' F R",
    category: "oll",
    difficulty: "intermediate",
    description: "Opposite edges oriented",
    tips: ["Watch the wide r move", "Practice smooth transitions"],
    averageMoves: 8,
  },

  // PLL (Permutation of Last Layer)
  {
    id: "pll-ua",
    name: "Ua Perm",
    algorithm: "R U' R U R U R U' R' U' R2",
    category: "pll",
    difficulty: "intermediate",
    description: "Three corners swap clockwise",
    tips: ["Very common PLL", "Fast when executed well"],
    recognitionTips: "One corner solved, three edges need swapping",
    averageMoves: 11,
  },
  {
    id: "pll-ub",
    name: "Ub Perm",
    algorithm: "R2 U R U R' U' R' U' R' U R'",
    category: "pll",
    difficulty: "intermediate",
    description: "Three corners swap counter-clockwise",
    tips: ["Mirror of Ua", "Start with R2"],
    recognitionTips: "Opposite of Ua perm",
    averageMoves: 11,
  },
  {
    id: "pll-h",
    name: "H Perm",
    algorithm: "M2 U M2 U2 M2 U M2",
    category: "pll",
    difficulty: "intermediate",
    description: "Swap opposite edge pairs",
    tips: ["Use M moves efficiently", "Practice the rhythm"],
    recognitionTips: "Two sets of opposite edges swapped",
    averageMoves: 7,
  },
  {
    id: "pll-z",
    name: "Z Perm",
    algorithm: "M' U M2 U M2 U M' U2 M2",
    category: "pll",
    difficulty: "intermediate",
    description: "Diagonal edge swap",
    tips: ["Tricky M moves", "Keep cube stable"],
    recognitionTips: "Diagonal edges swapped",
    averageMoves: 9,
  },
  {
    id: "pll-aa",
    name: "Aa Perm",
    algorithm: "x R' U R' D2 R U' R' D2 R2 x'",
    category: "pll",
    difficulty: "advanced",
    description: "Three corner cycle",
    tips: ["Rotation helps", "Fast with practice"],
    recognitionTips: "All edges solved, corners need cycling",
    averageMoves: 9,
  },
  {
    id: "pll-ab",
    name: "Ab Perm",
    algorithm: "x R2 D2 R U R' D2 R U' R x'",
    category: "pll",
    difficulty: "advanced",
    description: "Three corner cycle (opposite direction)",
    tips: ["Mirror of Aa", "Watch the rotation"],
    averageMoves: 9,
  },
  {
    id: "pll-t",
    name: "T Perm",
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    category: "pll",
    difficulty: "advanced",
    description: "Swap adjacent edges and corners",
    tips: ["Longer algorithm", "Break into chunks"],
    recognitionTips: "Headlights on left and right",
    averageMoves: 14,
  },
  {
    id: "pll-j",
    name: "Ja Perm",
    algorithm: "x R2 F R F' R U2 r' U r U2 x'",
    category: "pll",
    difficulty: "advanced",
    description: "Adjacent corner swap",
    tips: ["Fast J perm", "Use rotation"],
    averageMoves: 9,
  },
  {
    id: "pll-y",
    name: "Y Perm",
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    category: "pll",
    difficulty: "advanced",
    description: "Diagonal corner swap",
    tips: ["Long but recognizable", "Practice in sections"],
    averageMoves: 17,
  },

  // Advanced Algorithms
  {
    id: "advanced-sexy",
    name: "Sexy Move",
    algorithm: "R U R' U'",
    category: "advanced",
    difficulty: "beginner",
    description: "Most common trigger in cubing",
    tips: ["Foundation of many algorithms", "Practice until automatic"],
    averageMoves: 4,
  },
  {
    id: "advanced-sledge",
    name: "Sledgehammer",
    algorithm: "R' F R F'",
    category: "advanced",
    difficulty: "beginner",
    description: "Common trigger sequence",
    tips: ["Complements sexy move", "Very useful in F2L"],
    averageMoves: 4,
  },
  {
    id: "advanced-hedge",
    name: "Hedgeslammer",
    algorithm: "F R' F' R",
    category: "advanced",
    difficulty: "intermediate",
    description: "Mirror of sledgehammer",
    tips: ["Less common but useful", "Practice both versions"],
    averageMoves: 4,
  },
];

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "Understanding Cube Notation",
    category: "notation",
    difficulty: "beginner",
    description: "Learn how to read and write cube algorithms",
    duration: "15 min",
    content: [
      {
        type: "text",
        title: "Basic Notation",
        content: "Each face of the cube is represented by a letter: R (Right), L (Left), U (Up), D (Down), F (Front), B (Back).",
        notes: [
          "A letter by itself means turn that face 90° clockwise",
          "A letter with ' (prime) means turn counter-clockwise",
          "A letter with 2 means turn 180°",
        ],
      },
      {
        type: "interactive",
        title: "Try It Yourself",
        content: "Watch how the R move works",
        algorithm: "R",
      },
      {
        type: "text",
        title: "Wide Moves",
        content: "Lowercase letters (r, u, f, etc.) mean move that face AND the middle layer",
        notes: [
          "r = R + M (middle layer)",
          "u = U + E (equator layer)",
          "f = F + S (standing layer)",
        ],
      },
    ],
    algorithms: ALGORITHMS.filter(a => a.category === "basic-moves"),
  },
  {
    id: "lesson-2",
    title: "Solving the Cross",
    category: "cross",
    difficulty: "beginner",
    description: "Master the first step of CFOP method",
    duration: "20 min",
    content: [
      {
        type: "text",
        title: "What is the Cross?",
        content: "The cross is four edge pieces on the bottom face forming a plus sign. This is the foundation of the CFOP method.",
        notes: [
          "Choose a color (usually white) for your cross",
          "Solve all four edges matching the center colors",
          "Aim for efficiency (8 moves or less)",
        ],
      },
      {
        type: "text",
        title: "Cross Strategy",
        content: "Look ahead and plan your cross during inspection time. Advanced solvers can solve the cross in 4-6 moves.",
      },
    ],
    algorithms: ALGORITHMS.filter(a => a.category === "cross"),
  },
  {
    id: "lesson-3",
    title: "F2L - First Two Layers",
    category: "f2l",
    difficulty: "intermediate",
    description: "Learn intuitive and algorithmic F2L",
    duration: "30 min",
    content: [
      {
        type: "text",
        title: "What is F2L?",
        content: "F2L stands for First Two Layers. Instead of solving layer by layer, you solve a corner and edge pair simultaneously.",
        notes: [
          "41 different F2L cases",
          "Most can be solved intuitively",
          "Focus on pair recognition",
        ],
      },
      {
        type: "text",
        title: "Basic Cases",
        content: "Start with the easiest cases where both pieces are in the top layer.",
      },
    ],
    algorithms: ALGORITHMS.filter(a => a.category === "f2l"),
  },
  {
    id: "lesson-4",
    title: "OLL - Orient Last Layer",
    category: "oll",
    difficulty: "intermediate",
    description: "Orient all pieces on the last layer",
    duration: "45 min",
    content: [
      {
        type: "text",
        title: "What is OLL?",
        content: "OLL (Orientation of Last Layer) makes all last layer pieces face upward. There are 57 cases, but you can start with just 2-look OLL (10 algorithms).",
        notes: [
          "Start with 2-look OLL (easier)",
          "Learn edge orientation first",
          "Then learn corner orientation",
          "Full OLL has 57 cases",
        ],
      },
    ],
    algorithms: ALGORITHMS.filter(a => a.category === "oll"),
  },
  {
    id: "lesson-5",
    title: "PLL - Permute Last Layer",
    category: "pll",
    difficulty: "intermediate",
    description: "Solve the cube completely",
    duration: "45 min",
    content: [
      {
        type: "text",
        title: "What is PLL?",
        content: "PLL (Permutation of Last Layer) puts all last layer pieces in their correct positions. There are 21 cases in total.",
        notes: [
          "Start with 2-look PLL (6 algorithms)",
          "Learn corner permutation first",
          "Then learn edge permutation",
          "Full PLL has 21 cases",
        ],
      },
    ],
    algorithms: ALGORITHMS.filter(a => a.category === "pll"),
  },
];

// Helper function to get algorithms by category
export const getAlgorithmsByCategory = (category: string) => {
  return ALGORITHMS.filter(alg => alg.category === category);
};

// Helper function to get algorithms by difficulty
export const getAlgorithmsByDifficulty = (difficulty: string) => {
  return ALGORITHMS.filter(alg => alg.difficulty === difficulty);
};

// Search algorithms
export const searchAlgorithms = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return ALGORITHMS.filter(alg => 
    alg.name.toLowerCase().includes(lowerQuery) ||
    alg.description.toLowerCase().includes(lowerQuery) ||
    alg.algorithm.toLowerCase().includes(lowerQuery)
  );
};