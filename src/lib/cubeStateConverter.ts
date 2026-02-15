// src/lib/cubeStateConverter.ts
// Convert visual cube state to scramble notation

type Color = "white" | "red" | "green" | "yellow" | "orange" | "blue";
type CubeFace = "U" | "R" | "F" | "D" | "L" | "B";

interface CubeState {
  U: Color[][];
  R: Color[][];
  F: Color[][];
  D: Color[][];
  L: Color[][];
  B: Color[][];
}

/**
 * Convert a cube state to scramble notation
 * This uses a simplified approach - in production, integrate with a cube solver library
 */
export function cubeStateToScramble(cubeState: CubeState): string {
  // Check if cube is already solved
  if (isSolved(cubeState)) {
    return ""; // Empty scramble for solved cube
  }

  // For a proper implementation, you would:
  // 1. Use kociemba algorithm or similar to find optimal solution
  // 2. Invert the solution to get the scramble
  // 3. Return the inverted moves

  // This is a placeholder that analyzes the cube state
  // and generates a plausible scramble

  const moves: string[] = [];

  // Analyze each face to determine approximate scramble
  // This is a simplified heuristic approach

  // Check top layer orientation
  if (!faceIsOriented(cubeState.U, "white")) {
    moves.push(...getOrientationMoves(cubeState.U, "white"));
  }

  // Check middle layer
  if (!middleLayerSolved(cubeState)) {
    moves.push(...getMiddleLayerMoves());
  }

  // Check bottom layer
  if (!faceIsOriented(cubeState.D, "yellow")) {
    moves.push(...getOrientationMoves(cubeState.D, "yellow"));
  }

  return moves.join(" ");
}

/**
 * Check if cube is in solved state
 */
function isSolved(cubeState: CubeState): boolean {
  const faceColors: { [key in CubeFace]: Color } = {
    U: "white",
    R: "red",
    F: "green",
    D: "yellow",
    L: "orange",
    B: "blue",
  };

  for (const [face, expectedColor] of Object.entries(faceColors) as [CubeFace, Color][]) {
    if (!faceIsOriented(cubeState[face], expectedColor)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a face has all stickers of the same color
 */
function faceIsOriented(face: Color[][], expectedColor: Color): boolean {
  return face.every((row) => row.every((color) => color === expectedColor));
}

/**
 * Check if middle layer is solved
 */
function middleLayerSolved(cubeState: CubeState): boolean {
  // Simplified check - just verify middle edges
  const middleEdges = [
    cubeState.F[1][0], // Front-left
    cubeState.F[1][2], // Front-right
    cubeState.R[1][0], // Right-front
    cubeState.R[1][2], // Right-back
  ];

  // This is a placeholder - proper implementation would check actual positions
  return false;
}

/**
 * Generate moves to orient a face (placeholder)
 */
function getOrientationMoves(face: Color[][], targetColor: Color): string[] {
  const moves: string[] = [];

  // Count misoriented stickers
  let misoriented = 0;
  face.forEach((row) => {
    row.forEach((color) => {
      if (color !== targetColor) misoriented++;
    });
  });

  // Generate random-ish moves based on misorientation
  const baseMoves = ["R", "U", "F"];
  const modifiers = ["", "'", "2"];

  for (let i = 0; i < Math.min(misoriented, 5); i++) {
    const move = baseMoves[i % baseMoves.length];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(move + modifier);
  }

  return moves;
}

/**
 * Generate moves for middle layer (placeholder)
 */
function getMiddleLayerMoves(): string[] {
  return ["R", "U'", "R'", "U'"];
}

/**
 * Validate cube state
 * Ensures each color appears exactly 9 times
 */
export function validateCubeState(cubeState: CubeState): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const colorCounts: { [key in Color]: number } = {
    white: 0,
    yellow: 0,
    red: 0,
    orange: 0,
    green: 0,
    blue: 0,
  };

  // Count colors
  Object.values(cubeState).forEach((face) => {
    face.forEach((row) => {
      row.forEach((color) => {
        colorCounts[color]++;
      });
    });
  });

  // Check counts
  const colorNames: { [key in Color]: string } = {
    white: "White",
    yellow: "Yellow",
    red: "Red",
    orange: "Orange",
    green: "Green",
    blue: "Blue",
  };

  for (const [color, count] of Object.entries(colorCounts) as [Color, number][]) {
    if (count !== 9) {
      errors.push(`${colorNames[color]} appears ${count} times (should be 9)`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a solved cube state
 */
export function generateSolvedState(): CubeState {
  return {
    U: [
      ["white", "white", "white"],
      ["white", "white", "white"],
      ["white", "white", "white"],
    ],
    R: [
      ["red", "red", "red"],
      ["red", "red", "red"],
      ["red", "red", "red"],
    ],
    F: [
      ["green", "green", "green"],
      ["green", "green", "green"],
      ["green", "green", "green"],
    ],
    D: [
      ["yellow", "yellow", "yellow"],
      ["yellow", "yellow", "yellow"],
      ["yellow", "yellow", "yellow"],
    ],
    L: [
      ["orange", "orange", "orange"],
      ["orange", "orange", "orange"],
      ["orange", "orange", "orange"],
    ],
    B: [
      ["blue", "blue", "blue"],
      ["blue", "blue", "blue"],
      ["blue", "blue", "blue"],
    ],
  };
}

/**
 * For production use, integrate with a proper cube solving library:
 *
 * Recommended libraries:
 * 1. Cube Solver JS: https://github.com/ldez/cubejs
 * 2. Kociemba Solver: Two-phase algorithm for optimal solutions
 * 3. cubing.js: Has built-in solving capabilities
 *
 * Example integration with cubing.js:
 *
 * import { Alg } from "cubing/alg";
 * import { TwistyPlayer } from "cubing/twisty";
 *
 * async function solveFromState(cubeState: CubeState) {
 *   // Convert cube state to cubing.js format
 *   const stateString = convertToStateString(cubeState);
 *
 *   // Use solver
 *   const solution = await solveCube(stateString);
 *
 *   // Invert solution to get scramble
 *   const scramble = invertAlgorithm(solution);
 *
 *   return scramble;
 * }
 */
