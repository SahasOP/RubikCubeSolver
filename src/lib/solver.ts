// src/lib/solver.ts
// Highly Optimized Bidirectional BFS Solver for 2x2x2 Rubik's Cube

import { toast } from "sonner";
import { CubeState, CubeType } from "./Cube";

export interface Solution {
  moves: string[];
  length: number;
}

export interface SolverResult {
  solutions: Record<number, Solution[]>;
  totalSolutions: number;
  executionTime: number;
  status: "success" | "timeout" | "error";
  error?: string;
}

const MAX_SOLUTIONS = 20;
const TIMEOUT_MS = 500;

/**
 * 2x2x2 Cube State Representation
 * 24 stickers total (6 faces × 4 stickers each)
 */
type CubeArray = Uint8Array;

function createSolved(): CubeArray {
  const state = new Uint8Array(24);
  for (let i = 0; i < 24; i++) {
    state[i] = Math.floor(i / 4);
  }
  return state;
}

/**
 * Move cycles for 2x2x2 cube
 */
const MOVES: Record<string, number[][]> = {
  R: [
    [4, 5, 7, 6],
    [3, 11, 14, 23],
    [1, 9, 12, 21],
  ],
  L: [
    [16, 17, 19, 18],
    [0, 20, 15, 8],
    [2, 22, 13, 10],
  ],
  U: [
    [0, 1, 3, 2],
    [16, 20, 4, 8],
    [17, 21, 5, 9],
  ],
  D: [
    [12, 13, 15, 14],
    [10, 6, 22, 18],
    [11, 7, 23, 19],
  ],
  F: [
    [8, 9, 11, 10],
    [2, 4, 13, 19],
    [3, 6, 12, 17],
  ],
  B: [
    [20, 21, 23, 22],
    [1, 16, 14, 7],
    [0, 18, 15, 5],
  ],
};

/**
 * Apply 4-cycle to cube state
 */
function applyCycle(state: CubeArray, cycle: number[]): void {
  const temp = state[cycle[0]];
  state[cycle[0]] = state[cycle[1]];
  state[cycle[1]] = state[cycle[2]];
  state[cycle[2]] = state[cycle[3]];
  state[cycle[3]] = temp;
}

/**
 * Apply a move to cube state (in-place)
 */
function applyMove(state: CubeArray, move: string): void {
  const face = move[0];
  const cycles = MOVES[face];
  if (!cycles) return;

  const times = move.length === 2 ? (move[1] === "2" ? 2 : 3) : 1;

  for (let t = 0; t < times; t++) {
    for (const cycle of cycles) {
      applyCycle(state, cycle);
    }
  }
}

/**
 * Check if cube is solved
 */
function isSolved(state: CubeArray): boolean {
  for (let face = 0; face < 6; face++) {
    const baseIndex = face * 4;
    const color = state[baseIndex];
    for (let i = 1; i < 4; i++) {
      if (state[baseIndex + i] !== color) return false;
    }
  }
  return true;
}

/**
 * Hash cube state - optimized
 */
function hashState(state: CubeArray): string {
  return state.join(",");
}

/**
 * Clone cube state
 */
function cloneState(state: CubeArray): CubeArray {
  return new Uint8Array(state);
}

/**
 * Get scrambled state
 */
function getScrambledState(moves: string[]): CubeArray {
  const state = createSolved();
  for (const move of moves) {
    applyMove(state, move);
  }
  return state;
}

/**
 * Parse scramble string
 */
function parseScramble(scramble: string): string[] {
  const faces = ["R", "U", "F", "L", "D", "B"];
  return scramble
    .trim()
    .split(/\s+/)
    .map((m) => {
      const modifier = m.match(/['2]/) ? m.match(/['2]/)![0] : "";
      const face = m.replace(/['2]/g, "").toUpperCase();
      return faces.includes(face) ? face + modifier : null;
    })
    .filter(Boolean) as string[];
}

/**
 * Generate move set
 */
function generateMoveSet(baseMoves: string[], allFaces: string[]): string[] {
  const faces = Array.from(new Set(baseMoves.map((m) => m.replace(/['2]/g, "").toUpperCase()).filter((f) => allFaces.includes(f))));

  const moves: string[] = [];
  for (const face of faces) {
    moves.push(face, face + "'", face + "2");
  }
  return moves;
}

/**
 * Invert a move
 */
function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1);
  if (move.endsWith("2")) return move;
  return move + "'";
}

/**
 * Invert and reverse sequence
 */
function invertSequence(moves: string[]): string[] {
  return moves.map(invertMove).reverse();
}

/**
 * Verify solution
 */
function verifySolution(scramble: string[], solution: string[]): boolean {
  const state = createSolved();
  for (const move of scramble) applyMove(state, move);
  for (const move of solution) applyMove(state, move);
  return isSolved(state);
}

/**
 * Check if move should be pruned
 */
function shouldPrune(lastMove: string | undefined, newMove: string): boolean {
  if (!lastMove) return false;

  const lastFace = lastMove[0];
  const newFace = newMove[0];

  // Don't repeat same face
  if (lastFace === newFace) {
    // allow R R2 but not R R'
    return invertMove(lastMove) === newMove;
  }

  // Canonicalize opposite pairs
  if ((lastFace === "L" && newFace === "R") || (lastFace === "D" && newFace === "U") || (lastFace === "B" && newFace === "F")) {
    return true;
  }

  return false;
}

/**
 * Simplify consecutive moves on same face
 */
function simplifyMoves(moves: string[]): string[] {
  const simplified: string[] = [];

  for (const move of moves) {
    if (simplified.length === 0) {
      simplified.push(move);
      continue;
    }

    const last = simplified[simplified.length - 1];
    if (last[0] === move[0]) {
      // Same face - combine moves
      let totalTurns = 0;
      totalTurns += last.length === 2 ? (last[1] === "2" ? 2 : 3) : 1;
      totalTurns += move.length === 2 ? (move[1] === "2" ? 2 : 3) : 1;
      totalTurns %= 4;

      simplified.pop();
      if (totalTurns === 1) simplified.push(move[0]);
      else if (totalTurns === 2) simplified.push(move[0] + "2");
      else if (totalTurns === 3) simplified.push(move[0] + "'");
    } else {
      simplified.push(move);
    }
  }

  return simplified;
}

/**
 * Bidirectional BFS solver - Highly Optimized
 */
async function bidirectionalBFS(scramble: string[], moves: string[], maxDepth: number, startTime: number, onSolution?: (solution: Solution) => void): Promise<Solution[]> {
  const solutions: Solution[] = [];
  const solved = createSolved();
  const scrambled = getScrambledState(scramble);

  // Check if already solved
  if (isSolved(scrambled)) {
    return [{ moves: [], length: 0 }];
  }

  // Forward: scrambled → solved
  const fwdQueue: Array<{ state: CubeArray; path: string[] }> = [];
  const fwdVisited = new Map<string, string[]>();

  // Backward: solved → scrambled
  const bwdQueue: Array<{ state: CubeArray; path: string[] }> = [];
  const bwdVisited = new Map<string, string[]>();

  fwdQueue.push({ state: scrambled, path: [] });
  fwdVisited.set(hashState(scrambled), []);

  bwdQueue.push({ state: solved, path: [] });
  bwdVisited.set(hashState(solved), []);

  const halfDepth = Math.ceil(maxDepth / 2);
  const solutionSet = new Set<string>();
  let fwdDepth = 0;
  let bwdDepth = 0;

  while (fwdDepth <= halfDepth && bwdDepth <= halfDepth) {
    // Yield periodically to the event loop so streaming callbacks can update the UI
    // (this prevents long synchronous computation from blocking React renders)
    if ((fwdQueue.length + bwdQueue.length) % 50 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (solutions.length >= MAX_SOLUTIONS || performance.now() - startTime > TIMEOUT_MS) {
      break;
    }

    // Alternate between forward and backward for balance
    // Expand smaller frontier first
    const expandForward = fwdQueue.length <= bwdQueue.length;

    if (expandForward && fwdDepth < halfDepth) {
      const queueSize = fwdQueue.length;
      if (queueSize === 0) break;

      for (let i = 0; i < queueSize; i++) {
        if (solutions.length >= MAX_SOLUTIONS) break;

        const { state, path } = fwdQueue.shift()!;

        for (const move of moves) {
          if (shouldPrune(path[path.length - 1], move)) continue;

          const newState = cloneState(state);
          applyMove(newState, move);
          const hash = hashState(newState);
          if (path.length + 1 > halfDepth) continue;

          const newPath = [...path, move];

          // Check collision with backward
          if (bwdVisited.has(hash)) {
            const bwdPath = bwdVisited.get(hash)!;
            const solution = simplifyMoves([...newPath, ...invertSequence(bwdPath)]);

            if (solution.length <= maxDepth) {
              const key = solution.join(" ");
              if (!solutionSet.has(key) && verifySolution(scramble, solution)) {
                solutionSet.add(key);
                const solObj = { moves: solution, length: solution.length };
                solutions.push(solObj);
                onSolution?.(solObj);
              }
            }
          }

          // Add to forward if new
          if (!fwdVisited.has(hash)) {
            fwdVisited.set(hash, newPath);
            fwdQueue.push({ state: newState, path: newPath });
          }
        }
      }
      fwdDepth++;
    }

    if (!expandForward && bwdDepth < halfDepth) {
      const queueSize = bwdQueue.length;
      if (queueSize === 0) break;

      for (let i = 0; i < queueSize; i++) {
        if (solutions.length >= MAX_SOLUTIONS) break;

        const { state, path } = bwdQueue.shift()!;

        for (const move of moves) {
          if (shouldPrune(path[path.length - 1], move)) continue;

          const newState = cloneState(state);
          applyMove(newState, move);
          const hash = hashState(newState);
          if (path.length + 1 > halfDepth) continue;

          const newPath = [...path, move];

          // Check collision with forward
          if (fwdVisited.has(hash)) {
            const fwdPath = fwdVisited.get(hash)!;
            const solution = simplifyMoves([...fwdPath, ...invertSequence(newPath)]);

            if (solution.length <= maxDepth) {
              const key = solution.join(" ");
              if (!solutionSet.has(key)) {
                solutionSet.add(key);
                const solObj = { moves: solution, length: solution.length };
                solutions.push(solObj);
                onSolution?.(solObj); // stream solution immediately
              }
            }
          }

          // Add to backward if new
          if (!bwdVisited.has(hash)) {
            bwdVisited.set(hash, newPath);
            bwdQueue.push({ state: newState, path: newPath });
          }
        }
      }
      bwdDepth++;
    }
  }

  // Add inverse as guaranteed solution
  if (solutions.length === 0) {
    const inverse = invertSequence(scramble);
    if (inverse.length <= maxDepth && verifySolution(scramble, inverse)) {
      const solObj = { moves: inverse, length: inverse.length };
      solutions.push(solObj);
      onSolution?.(solObj);
    }
  }

  return solutions.slice(0, MAX_SOLUTIONS);
}

/**
 * Main solver export
 */
export async function findSolutions(scramble: string, cubeType: CubeType = "3x3", maxDepth: number = 5, allowedMoves?: string[], onSolution?: (solution: Solution) => void): Promise<SolverResult> {
  const startTime = performance.now();

  try {
    const scrambleMoves = parseScramble(scramble);
    if (scrambleMoves.length === 0) {
      return {
        solutions: {},
        totalSolutions: 0,
        executionTime: 0,
        status: "success",
      };
    }

    const allFaces = ["R", "U", "F", "L", "D", "B"];
    const solutionMoves = allowedMoves && allowedMoves.length > 0 ? generateMoveSet(allowedMoves, allFaces) : generateMoveSet(allFaces, allFaces);

    console.log("Solving:", scrambleMoves.join(" "), "depth:", maxDepth);

    const found = await bidirectionalBFS(scrambleMoves, solutionMoves, maxDepth, startTime, onSolution);

    const solutions: Record<number, Solution[]> = {};
    for (const sol of found) {
      if (!solutions[sol.length]) solutions[sol.length] = [];
      solutions[sol.length].push(sol);
    }

    const time = performance.now() - startTime;
    if (found.length > 0) {
      toast.success(`🧊 ${found.length} solution${found.length !== 1 ? "s" : ""} in ${Math.round(time)} ms`);
    } else {
      toast.error("❌ No valid solution found", {
        description: "Check cube orientation or colors",
      });
    }

    return {
      solutions,
      totalSolutions: found.length,
      executionTime: time,
      status: time > TIMEOUT_MS ? "timeout" : "success",
    };
  } catch (error) {
    return {
      solutions: {},
      totalSolutions: 0,
      executionTime: performance.now() - startTime,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default findSolutions;
