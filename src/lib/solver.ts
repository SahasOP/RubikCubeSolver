// src/lib/solver.ts
// Service Manager Layer with Web Worker & Caching System

import { toast } from "sonner";
import { CubeType } from "./Cube";
import type { WorkerResponse, WorkerMessage, Solution } from "./solver.worker";

export interface SolverResult {
  solutions: Record<number, Solution[]>;
  totalSolutions: number;
  executionTime: number;
  status: "success" | "timeout" | "error";
  error?: string;
  nodesEvaluated?: number;
}

export type { Solution };

// LRU/Memoization Cache (System Design Concept: Caching Layer)
const computationCache = new Map<string, SolverResult>();

/**
 * Main solver export - Managed by Web Worker
 */
export async function findSolutions(scramble: string, cubeType: CubeType = "3x3", maxDepth: number = 5, allowedMoves?: string[], onSolution?: (solution: Solution) => void): Promise<SolverResult> {
  const cacheKey = JSON.stringify({ scramble, maxDepth, allowedMoves });
  
  // Memoization layer check
  if (computationCache.has(cacheKey)) {
    const cached = computationCache.get(cacheKey)!;
    console.log("⚡ Cache hit! Returning instant result.");
    
    // Simulate streaming for the UI to prevent jarring visual jump
    setTimeout(() => {
        if (onSolution) {
          Object.values(cached.solutions).flat().forEach((sol) => onSolution(sol));
        }
        toast.success(`⚡ Quick Cache Hit: ${cached.totalSolutions} solutions loaded instantly`);
    }, 100);

    return cached;
  }

  return new Promise((resolve) => {
    // Spawning dedicated Web Worker thread
    const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
    
    // Local state to accumulate solutions before resolving
    const solutions: Record<number, Solution[]> = {};

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;

      if (msg.type === "SOLUTION_FOUND" && msg.solution) {
        // Build map
        if (!solutions[msg.solution.length]) solutions[msg.solution.length] = [];
        solutions[msg.solution.length].push(msg.solution);
        
        // Trigger UI Callback to stream data into the DOM
        if (onSolution) onSolution(msg.solution);
      }

      if (msg.type === "SEARCH_COMPLETE") {
        const result: SolverResult = {
          solutions,
          totalSolutions: msg.totalSolutions || 0,
          executionTime: msg.executionTime || 0,
          status: msg.status || "success",
          nodesEvaluated: msg.nodesEvaluated || 0
        };

        if (result.totalSolutions > 0) {
          toast.success(`🧊 ${result.totalSolutions} solution(s) in ${Math.round(result.executionTime)} ms`, {
            description: `Nodes Evaluated: ${result.nodesEvaluated?.toLocaleString()}`
          });
        } else {
          toast.error("❌ No valid solution found", { description: "Current bounds might be too tight." });
        }

        // Save to cache
        computationCache.set(cacheKey, result);
        
        worker.terminate();
        resolve(result);
      }

      if (msg.type === "ERROR") {
        toast.error("Math Engine Error", { description: msg.error });
        worker.terminate();
        resolve({
          solutions: {},
          totalSolutions: 0,
          executionTime: 0,
          status: "error",
          error: msg.error
        });
      }
    };

    worker.onerror = (err) => {
      console.error(err);
      toast.error("Fatal Worker Thread Error");
      worker.terminate();
      resolve({
         solutions: {},
         totalSolutions: 0,
         executionTime: 0,
         status: "error",
         error: err.message
      });
    };

    // Dispatch job to the worker
    const payload: WorkerMessage = {
      type: "START_SEARCH",
      scramble,
      cubeType,
      maxDepth,
      allowedMoves: allowedMoves || []
    };
    
    worker.postMessage(payload);
  });
}

export default findSolutions;
