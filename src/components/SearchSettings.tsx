// src/components/SearchSettings.tsx
// Enhanced with visual cube input methods

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCubeStore } from "@/store/cubeStore";
import { findSolutions } from "../lib/solver";
import { convertVisualStateToScramble } from "@/lib/visualSolver";
import { PuzzleSelector } from "./PuzzleSelector";
import { CubeType } from "@/lib/Cube";
import { ColorPickerCubeInput } from "./ColorPickerCubeInput";
import { CameraInput } from "./CameraInput";
import { Search, Camera, Grid3x3, Keyboard, Palette, Zap, Settings, ChevronDown } from "lucide-react";
import { UnifiedCubeInput } from "./MultiModal";
import { ModalRoot } from "./ModalRoot";

interface SearchSettingsProps {
  puzzleSize: string;
  setPuzzleSize: (size: string) => void;
  onOpenColorPicker: () => void;
  onOpenCamera: () => void;
}

type InputMode = "text" | "visual" | "camera";

export function SearchSettings({ puzzleSize, setPuzzleSize, onOpenColorPicker, onOpenCamera }: SearchSettingsProps) {
  const { scrambleNotation, maxDepth, allowedMoves, setMaxDepth, toggleMove, setSolutions, setSearching, setScramble, isSearching } = useCubeStore();

  const [isLocalSearching, setIsLocalSearching] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Convert cube state to scramble notation
  const cubeStateToScramble = (cubeState: any): string => {
    // This is a simplified version - in production, use a proper cube solver
    // to find the moves needed to reach this state from solved

    // For now, we'll use a placeholder that simulates finding a scramble
    // In a real implementation, you would:
    // 1. Use a cube solver library to find moves from solved to this state
    // 2. Or use the inverse: solve the cube state and invert the solution

    console.log("Cube state received:", cubeState);

    // Placeholder: generate random-looking scramble
    // Replace this with actual cube solving logic
    const moves = ["R", "U", "F", "L", "D", "B"];
    const modifiers = ["", "'", "2"];
    const length = 15 + Math.floor(Math.random() * 5);

    let scramble = [];
    let lastMove = "";

    for (let i = 0; i < length; i++) {
      let move = moves[Math.floor(Math.random() * moves.length)];
      // Avoid same move twice in a row
      while (move === lastMove) {
        move = moves[Math.floor(Math.random() * moves.length)];
      }
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(move + modifier);
      lastMove = move;
    }

    return scramble.join(" ");
  };

  const handleVisualInputComplete = (cubeState: any) => {
    setShowColorPicker(false);
    setShowCamera(false);

    // Convert cube state to scramble
    // const scramble = cubeStateToScramble(cubeState);
    // setScramble(scramble);

    // // Show success message
    // alert("Cube state converted to scramble! You can now search for solutions.");
    // Convert cube state to scramble using cubejs
    try {
      const scramble = convertVisualStateToScramble(cubeState);
      setScramble(scramble);
      alert("Cube state converted to scramble! You can now search for solutions.");
    } catch (err) {
      console.error(err);
      alert(`Failed to convert cube state: ${err instanceof Error ? err.message : String(err)}. Make sure faces/centers are consistent.`);
    }
  };

  // Inside SearchSettings.tsx

  const handleSearch = async () => {
    if (!scrambleNotation.trim()) return;

    // 1. Clear UI state immediately
    setSolutions({});
    setIsLocalSearching(true);
    setSearching(true);

    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      const enabledMoves = Object.entries(allowedMoves)
        .filter(([_, enabled]) => enabled)
        .map(([move]) => move);

      // 2. Start solver with streaming callback
      await findSolutions(scrambleNotation, puzzleSize as CubeType, maxDepth, enabledMoves, (newSol) => {
        // IMPORTANT: Use functional update to ensure we don't miss solutions
        setSolutions((prev) => {
          const depth = newSol.length;
          const currentList = prev[depth] || [];

          // Check for duplicates
          if (currentList.some((s) => s.moves.join(" ") === newSol.moves.join(" "))) {
            return prev;
          }

          const updated = {
            ...prev,
            [depth]: [...currentList, newSol],
          };

          // Log to console so you can verify the solver is actually finding things
          console.log(`Streaming solution: ${newSol.moves.join(" ")}`);
          return updated;
        });
      });
    } catch (error) {
      console.error("Solver execution failed:", error);
    } finally {
      // setIsSearching(false);

      setIsLocalSearching(false);
      setSearching(false);
    }
  };

  const moveGroups = {
    "Face Turns": ["R", "U", "D", "F", "L", "B"],
    "Wide Turns": ["r", "u", "d", "f", "l", "b"],
    "Slice/Rotations": ["M", "S", "E", "x", "y", "z"],
  };

  const selectedCount = Object.values(allowedMoves).filter(Boolean).length;

  return (
    <>
      {isLocalSearching && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="space-y-3 text-sm">
        {/* INPUT METHOD */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
            <Palette className="w-3 h-3" />
            Input Method
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "text", icon: Keyboard, label: "Text" },
              { key: "visual", icon: Grid3x3, label: "Visual" },
              { key: "camera", icon: Camera, label: "Camera" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => {
                  setInputMode(key as InputMode);
                  if (key === "visual") {
                    setShowColorPicker(true);
                    // onOpenColorPicker();
                  }
                  if (key === "camera") {
                    setShowCamera(true);
                    // onOpenCamera();
                  }
                }}
                className={`flex flex-col items-center justify-center py-2 rounded-lg border text-xs transition
                ${inputMode === key ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <Icon className="w-4 h-4 mb-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* PUZZLE TYPE */}
          <div>
            <label className="text-xs font-semibold text-cyan-400 mb-1 block">Puzzle Type</label>
            <PuzzleSelector value={puzzleSize} onValueChange={setPuzzleSize} />
          </div>

          {/* MAX DEPTH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-cyan-400">Max Length</label>
              <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">{maxDepth}</span>
            </div>

            <input type="range" min={5} max={20} value={maxDepth} onChange={(e) => setMaxDepth(+e.target.value)} className="w-full h-1 accent-cyan-500" />

            <div className="flex justify-between text-[10px] text-white/40">
              <span>5</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* ALLOWED MOVES */}
        <div className="space-y-3 rounded-xl bg-[#1A2138]/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-s font-semibold text-purple-400">Allowed Moves</span>
            <span className="text-[10px] text-white/40">{selectedCount} / 4</span>
          </div>

          {Object.entries(moveGroups).map(([groupName, moves]) => (
            <div key={groupName}>
              <div className="text-[12px] uppercase text-white/40 mb-1">{groupName}</div>

              <div className="flex flex-wrap gap-1.5">
                {moves.map((move) => {
                  const isSelected = allowedMoves[move];
                  const isDisabled = !isSelected && selectedCount >= 4;

                  return (
                    <button
                      key={move}
                      disabled={isDisabled}
                      onClick={() => toggleMove(move)}
                      className={`flex-1 min-w-[48px] py-1.5 text-xs font-mono rounded-md border transition text-center
  ${isSelected ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"}
  ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}
`}
                    >
                      {move}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH BUTTON */}
        <button disabled={isLocalSearching || !scrambleNotation.trim()} onClick={handleSearch} className="relative w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed">
          {isLocalSearching ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching...
            </span>
          ) : (
            "Find Solutions"
          )}
        </button>

        {/* INFO TEXT */}
        <p className="text-[10px] text-white/40 text-center">
          {inputMode === "text" && "Enter scramble notation"}
          {inputMode === "visual" && "Set cube stickers visually"}
          {inputMode === "camera" && "Scan your cube"}
        </p>
      </div>

      {/* Visual Input Modals */}
      {/* <AnimatePresence>{showColorPicker && <ColorPickerCubeInput onComplete={handleVisualInputComplete} onCancel={() => setShowColorPicker(false)} />}</AnimatePresence>

      <AnimatePresence>{showCamera && <CameraInput onComplete={handleVisualInputComplete} onCancel={() => setShowCamera(false)} />}</AnimatePresence> */}
      {(showColorPicker || showCamera) && (
        <ModalRoot>
          <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatePresence>
              {showColorPicker && (
                <ColorPickerCubeInput
                  onComplete={handleVisualInputComplete}
                  onCancel={() => {
                    setShowColorPicker(false);
                    onOpenColorPicker();
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showCamera && (
                <ModalRoot>
                  <CameraInput puzzleSize={puzzleSize} onComplete={handleVisualInputComplete} onCancel={() => setShowCamera(false)} />
                </ModalRoot>
              )}
            </AnimatePresence>
          </motion.div>
        </ModalRoot>
      )}
      <AnimatePresence>
        {isSearching && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Engine Processing</span>
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[10px] font-mono text-cyan-300">
                  {Object.values(useCubeStore.getState().solutions).flat().length} FOUND
                </motion.span>
              </div>
              {/* Progress bar animation */}
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 0.5, ease: "easeOut" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
