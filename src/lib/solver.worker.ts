// src/lib/solver.worker.ts
// Mathematical Backend executed on separate Web Worker thread.

export interface Solution {
  moves: string[];
  length: number;
}

export type SolverResultStatus = "success" | "timeout" | "error";

export interface WorkerMessage {
  type: "START_SEARCH";
  scramble: string;
  cubeType: string;
  maxDepth: number;
  allowedMoves: string[];
}

export interface WorkerResponse {
  type: "SOLUTION_FOUND" | "SEARCH_COMPLETE" | "ERROR";
  solution?: Solution;
  status?: SolverResultStatus;
  totalSolutions?: number;
  executionTime?: number;
  error?: string;
  nodesEvaluated?: number;
}

const MAX_SOLUTIONS = 20;
const TIMEOUT_MS = 2000; // Worker can afford more time

type CubeArray = Uint8Array;

function createSolved(): CubeArray {
  const state = new Uint8Array(24);
  for (let i = 0; i < 24; i++) {
    state[i] = Math.floor(i / 4);
  }
  return state;
}

const MOVES: Record<string, number[][]> = {
  R: [[4, 5, 7, 6], [3, 11, 14, 23], [1, 9, 12, 21]],
  L: [[16, 17, 19, 18], [0, 20, 15, 8], [2, 22, 13, 10]],
  U: [[0, 1, 3, 2], [16, 20, 4, 8], [17, 21, 5, 9]],
  D: [[12, 13, 15, 14], [10, 6, 22, 18], [11, 7, 23, 19]],
  F: [[8, 9, 11, 10], [2, 4, 13, 19], [3, 6, 12, 17]],
  B: [[20, 21, 23, 22], [1, 16, 14, 7], [0, 18, 15, 5]],
};

function applyCycle(state: CubeArray, cycle: number[]): void {
  const temp = state[cycle[0]];
  state[cycle[0]] = state[cycle[1]];
  state[cycle[1]] = state[cycle[2]];
  state[cycle[2]] = state[cycle[3]];
  state[cycle[3]] = temp;
}

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

function hashState(state: CubeArray): string {
  return state.join(",");
}

function cloneState(state: CubeArray): CubeArray {
  return new Uint8Array(state);
}

function getScrambledState(moves: string[]): CubeArray {
  const state = createSolved();
  for (const move of moves) {
    applyMove(state, move);
  }
  return state;
}

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

function generateMoveSet(baseMoves: string[], allFaces: string[]): string[] {
  const faces = Array.from(new Set(baseMoves.map((m) => m.replace(/['2]/g, "").toUpperCase()).filter((f) => allFaces.includes(f))));

  const moves: string[] = [];
  for (const face of faces) {
    moves.push(face, face + "'", face + "2");
  }
  return moves;
}

function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1);
  if (move.endsWith("2")) return move;
  return move + "'";
}

function invertSequence(moves: string[]): string[] {
  return moves.map(invertMove).reverse();
}

function verifySolution(scramble: string[], solution: string[]): boolean {
  const state = createSolved();
  for (const move of scramble) applyMove(state, move);
  for (const move of solution) applyMove(state, move);
  return isSolved(state);
}

function shouldPrune(lastMove: string | undefined, newMove: string): boolean {
  if (!lastMove) return false;
  const lastFace = lastMove[0];
  const newFace = newMove[0];
  if (lastFace === newFace) {
    return invertMove(lastMove) === newMove;
  }
  if ((lastFace === "L" && newFace === "R") || (lastFace === "D" && newFace === "U") || (lastFace === "B" && newFace === "F")) {
    return true;
  }
  return false;
}

function simplifyMoves(moves: string[]): string[] {
  const simplified: string[] = [];
  for (const move of moves) {
    if (simplified.length === 0) {
      simplified.push(move);
      continue;
    }
    const last = simplified[simplified.length - 1];
    if (last[0] === move[0]) {
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

function emitSolution(solution: string[]) {
  self.postMessage({
    type: "SOLUTION_FOUND",
    solution: { moves: solution, length: solution.length }
  });
}

async function bidirectionalBFS(scramble: string[], moves: string[], maxDepth: number, startTime: number): Promise<Solution[]> {
  const solutions: Solution[] = [];
  const solved = createSolved();
  const scrambled = getScrambledState(scramble);
  let nodesEvaluated = 0;

  if (isSolved(scrambled)) {
    return [{ moves: [], length: 0 }];
  }

  const fwdQueue: Array<{ state: CubeArray; path: string[] }> = [];
  const fwdVisited = new Map<string, string[]>();

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
    // Workers don't strictly need to yield, but doing so prevents killing the thread
    if ((fwdQueue.length + bwdQueue.length) % 500 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (solutions.length >= MAX_SOLUTIONS || performance.now() - startTime > TIMEOUT_MS) {
      break;
    }

    const expandForward = fwdQueue.length <= bwdQueue.length;

    if (expandForward && fwdDepth < halfDepth) {
      const queueSize = fwdQueue.length;
      if (queueSize === 0) break;

      for (let i = 0; i < queueSize; i++) {
        if (solutions.length >= MAX_SOLUTIONS) break;
        const { state, path } = fwdQueue.shift()!;
        
        for (const move of moves) {
          if (shouldPrune(path[path.length - 1], move)) continue;
          
          nodesEvaluated++;
          const newState = cloneState(state);
          applyMove(newState, move);
          const hash = hashState(newState);
          if (path.length + 1 > halfDepth) continue;

          const newPath = [...path, move];

          if (bwdVisited.has(hash)) {
            const bwdPath = bwdVisited.get(hash)!;
            const solution = simplifyMoves([...newPath, ...invertSequence(bwdPath)]);

            if (solution.length <= maxDepth) {
              const key = solution.join(" ");
              if (!solutionSet.has(key) && verifySolution(scramble, solution)) {
                solutionSet.add(key);
                const solObj = { moves: solution, length: solution.length };
                solutions.push(solObj);
                emitSolution(solution);
              }
            }
          }

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
          
          nodesEvaluated++;
          const newState = cloneState(state);
          applyMove(newState, move);
          const hash = hashState(newState);
          if (path.length + 1 > halfDepth) continue;

          const newPath = [...path, move];

          if (fwdVisited.has(hash)) {
            const fwdPath = fwdVisited.get(hash)!;
            const solution = simplifyMoves([...fwdPath, ...invertSequence(newPath)]);

            if (solution.length <= maxDepth) {
              const key = solution.join(" ");
              if (!solutionSet.has(key)) {
                solutionSet.add(key);
                const solObj = { moves: solution, length: solution.length };
                solutions.push(solObj);
                emitSolution(solution);
              }
            }
          }

          if (!bwdVisited.has(hash)) {
            bwdVisited.set(hash, newPath);
            bwdQueue.push({ state: newState, path: newPath });
          }
        }
      }
      bwdDepth++;
    }
  }

  if (solutions.length === 0) {
    const inverse = invertSequence(scramble);
    if (inverse.length <= maxDepth && verifySolution(scramble, inverse)) {
      const solObj = { moves: inverse, length: inverse.length };
      solutions.push(solObj);
      emitSolution(inverse);
    }
  }

  // Extend response with metrics
  (self as any)._nodesEvaluated = nodesEvaluated;
  return solutions.slice(0, MAX_SOLUTIONS);
}

// Master listener
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "START_SEARCH") {
    const { scramble, maxDepth, allowedMoves } = e.data;
    const startTime = performance.now();

    try {
      const scrambleMoves = parseScramble(scramble);
      if (scrambleMoves.length === 0) {
        self.postMessage({ type: "SEARCH_COMPLETE", totalSolutions: 0, executionTime: 0, status: "success" });
        return;
      }

      const allFaces = ["R", "U", "F", "L", "D", "B"];
      const solutionMoves = allowedMoves && allowedMoves.length > 0 
        ? generateMoveSet(allowedMoves, allFaces) 
        : generateMoveSet(allFaces, allFaces);

      const found = await bidirectionalBFS(scrambleMoves, solutionMoves, maxDepth, startTime);
      const time = performance.now() - startTime;
      const nodes = (self as any)._nodesEvaluated || 0;

      self.postMessage({
        type: "SEARCH_COMPLETE",
        totalSolutions: found.length,
        executionTime: time,
        status: time > TIMEOUT_MS ? "timeout" : "success",
        nodesEvaluated: nodes
      });

    } catch (error) {
      self.postMessage({
        type: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error in worker thread."
      });
    }
  }
};
