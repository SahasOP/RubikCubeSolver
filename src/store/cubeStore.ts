import { CubeType } from "@/lib/Cube";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CubeColor = "white" | "yellow" | "red" | "orange" | "blue" | "green";

export interface SolveRecord {
  id: string;
  time: number;
  scramble: string;
  date: Date;
  penalty?: "+2" | "DNF";
  session: string;
}

export interface Session {
  id: string;
  name: string;
  solves: SolveRecord[];
}

export interface AlgorithmSolution {
  moves: string[];
  length: number;
}

export interface GroupedSolutions {
  [length: number]: AlgorithmSolution[];
}
interface CubeStore {
  cubeType: CubeType;
  // Notation-based state for algorithm finder
  scrambleNotation: string;
  currentAlgorithm: string;

  // Algorithm search
  solutions: GroupedSolutions;
  isSearching: boolean;
  maxDepth: number;
  allowedMoves: Record<string, boolean>;

  // Legacy cube states (keeping for compatibility)
  startState: CubeColor[];
  goalState: CubeColor[];

  // Solution playback
  currentSolution: string;
  currentSolutionStep: number;
  isPlayingSolution: boolean;
  solutionSpeed: number;

  // Timer state (keeping for compatibility)
  isTimerRunning: boolean;
  isInspecting: boolean;
  inspectionTime: number;
  currentTime: number;
  timerReady: boolean;

  // Scramble (legacy)
  isScrambling: boolean;

  // Sessions & history
  sessions: Session[];
  currentSessionId: string;

  // Actions
  setScramble: (notation: string) => void;
  setCurrentAlgorithm: (notation: string) => void;
  generateRandomScramble: () => void;
  toggleMove: (move: string) => void;

  setStartState: (state: CubeColor[]) => void;
  setGoalState: (state: CubeColor[]) => void;
  setStartSticker: (index: number, color: CubeColor) => void;
  setGoalSticker: (index: number, color: CubeColor) => void;
  resetStartState: () => void;
  resetGoalState: () => void;
  setSolvedGoalState: () => void;

  setSearching: (searching: boolean) => void;
  setSolutions: (solutions: GroupedSolutions) => void;
  setMaxDepth: (depth: number) => void;
  setAllowedMoves: (moves: string[]) => void;

  setSolution: (solution: string) => void;
  setCurrentSolutionStep: (step: number) => void;
  setPlayingSolution: (playing: boolean) => void;
  setSolutionSpeed: (speed: number) => void;
  applyMove: (move: string) => void;

  setTimerRunning: (running: boolean) => void;
  setInspecting: (inspecting: boolean) => void;
  setInspectionTime: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setTimerReady: (ready: boolean) => void;

  setScrambling: (scrambling: boolean) => void;

  addSolve: (time: number, scramble: string) => void;
  updateSolve: (id: string, updates: Partial<SolveRecord>) => void;
  deleteSolve: (id: string) => void;
  createSession: (name: string) => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

// Initial solved cube state
const getSolvedCube = (): CubeColor[] => [
  // Front (white)
  "white",
  "white",
  "white",
  "white",
  "white",
  "white",
  "white",
  "white",
  "white",
  // Back (yellow)
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  "yellow",
  // Left (orange)
  "orange",
  "orange",
  "orange",
  "orange",
  "orange",
  "orange",
  "orange",
  "orange",
  "orange",
  // Right (red)
  "red",
  "red",
  "red",
  "red",
  "red",
  "red",
  "red",
  "red",
  "red",
  // Top (blue)
  "blue",
  "blue",
  "blue",
  "blue",
  "blue",
  "blue",
  "blue",
  "blue",
  "blue",
  // Bottom (green)
  "green",
  "green",
  "green",
  "green",
  "green",
  "green",
  "green",
  "green",
  "green",
];

const DEFAULT_ALLOWED_MOVES: Record<string, boolean> = {
  R: true,
  U: true,
  D: true,
  F: true,
  L: true,
  B: true,
  r: true,
  u: true,
  d: true,
  f: true,
  l: true,
  b: true,
  M: true,
  S: true,
  E: true,
  x: true,
  y: true,
  z: true,
};

const generateRandomScramble = (moveCount: number = 5, availableMoves: string[] = ["R", "U", "F", "L", "D", "B"]): string => {
  const moves = availableMoves;
  const modifiers = ["", "'", "2"];
  const scramble: string[] = [];
  let lastMove = "";

  for (let i = 0; i < moveCount; i++) {
    let move = moves[Math.floor(Math.random() * moves.length)];
    while (move === lastMove) {
      move = moves[Math.floor(Math.random() * moves.length)];
    }
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
    lastMove = move;
  }

  return scramble.join(" ");
};

export const useCubeStore = create<CubeStore>()(
  persist(
    (set, get) => ({
      cubeType: "3x3",
      scrambleNotation: "",
      currentAlgorithm: "",
      startState: getSolvedCube(),
      goalState: getSolvedCube(),
      solutions: {},
      isSearching: false,
      maxDepth: 16,
      allowedMoves: DEFAULT_ALLOWED_MOVES,
      currentSolution: "",
      currentSolutionStep: 0,
      isPlayingSolution: false,
      solutionSpeed: 1,
      isTimerRunning: false,
      isInspecting: false,
      inspectionTime: 15,
      currentTime: 0,
      timerReady: false,
      isScrambling: false,
      sessions: [{ id: "default", name: "Default Session", solves: [] }],
      currentSessionId: "default",

      setScramble: (notation) => set({ scrambleNotation: notation }),
      setCurrentAlgorithm: (notation) => set({ currentAlgorithm: notation }),
      generateRandomScramble: () => {
        const allMoves = ["R", "U", "F", "L", "D", "B"];
        const selectedMoves = allMoves.sort(() => 0.5 - Math.random()).slice(0, 3);
        const scramble = generateRandomScramble(10, selectedMoves);
        const newAllowedMoves = { ...DEFAULT_ALLOWED_MOVES };
        // Reset all to false
        Object.keys(newAllowedMoves).forEach((key) => (newAllowedMoves[key] = false));
        // Enable selected moves
        selectedMoves.forEach((move) => (newAllowedMoves[move] = true));
        set({ scrambleNotation: scramble, allowedMoves: newAllowedMoves });
      },
      toggleMove: (move) =>
        set((state) => ({
          allowedMoves: {
            ...state.allowedMoves,
            [move]: !state.allowedMoves[move],
          },
        })),

      setStartState: (state) => set({ startState: state }),
      setGoalState: (state) => set({ goalState: state }),
      setStartSticker: (index, color) =>
        set((state) => {
          const newState = [...state.startState];
          newState[index] = color;
          return { startState: newState };
        }),
      setGoalSticker: (index, color) =>
        set((state) => {
          const newState = [...state.goalState];
          newState[index] = color;
          return { goalState: newState };
        }),
      resetStartState: () => set({ startState: Array(54).fill("white") }),
      resetGoalState: () => set({ goalState: Array(54).fill("white") }),
      setSolvedGoalState: () => set({ goalState: getSolvedCube() }),
      setSearching: (searching) => set({ isSearching: searching }),
      setSolutions: (fn) =>
        set((state) => ({
          solutions: typeof fn === "function" ? fn(state.solutions) : fn,
        })),
      setMaxDepth: (depth) => set({ maxDepth: depth }),
      setAllowedMoves: (moves) => {
        // Support both array and object formats
        if (Array.isArray(moves)) {
          const moveObj: Record<string, boolean> = {};
          moves.forEach((m) => (moveObj[m] = true));
          set({ allowedMoves: moveObj });
        } else {
          set({ allowedMoves: moves });
        }
      },

      setSolution: (solution) => set({ currentSolution: solution, currentSolutionStep: 0 }),
      setCurrentSolutionStep: (step) => set({ currentSolutionStep: step }),
      setPlayingSolution: (playing) => set({ isPlayingSolution: playing }),
      setSolutionSpeed: (speed) => set({ solutionSpeed: speed }),
      applyMove: (move) => {
        // Simplified move application
        set((state) => ({ startState: [...state.startState] }));
      },

      setTimerRunning: (running) => set({ isTimerRunning: running }),
      setInspecting: (inspecting) => set({ isInspecting: inspecting }),
      setInspectionTime: (time) => set({ inspectionTime: time }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setTimerReady: (ready) => set({ timerReady: ready }),
      setScrambling: (scrambling) => set({ isScrambling: scrambling }),

      addSolve: (time, scramble) =>
        set((state) => {
          const newSolve: SolveRecord = {
            id: Math.random().toString(36).substr(2, 9),
            time,
            scramble,
            date: new Date(),
            session: state.currentSessionId,
          };

          const sessions = state.sessions.map((session) => (session.id === state.currentSessionId ? { ...session, solves: [...session.solves, newSolve] } : session));

          return { sessions };
        }),

      updateSolve: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) => ({
            ...session,
            solves: session.solves.map((solve) => (solve.id === id ? { ...solve, ...updates } : solve)),
          })),
        })),

      deleteSolve: (id) =>
        set((state) => ({
          sessions: state.sessions.map((session) => ({
            ...session,
            solves: session.solves.filter((solve) => solve.id !== id),
          })),
        })),

      createSession: (name) =>
        set((state) => ({
          sessions: [...state.sessions, { id: Math.random().toString(36).substr(2, 9), name, solves: [] }],
        })),

      switchSession: (id) => set({ currentSessionId: id }),

      deleteSession: (id) =>
        set((state) => {
          if (state.sessions.length === 1) return state;
          const newSessions = state.sessions.filter((s) => s.id !== id);
          return {
            sessions: newSessions,
            currentSessionId: state.currentSessionId === id ? newSessions[0].id : state.currentSessionId,
          };
        }),
    }),
    {
      name: "cube-storage",
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        maxDepth: state.maxDepth,
        allowedMoves: state.allowedMoves,
      }),
    },
  ),
);
