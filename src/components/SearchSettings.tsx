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

  // const [isSearching, setIsSearching] = useState(false);
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
    // setIsSearching(true);
    setSearching(true);

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
      <div className="space-y-4">
        {/* Input Mode Selector */}
        <div className="space-y-4">
          <label className="flex block text-sm font-bold text-cyan-300 mb-3 gap-2">
            <Palette className="w-4 h-4" />
            Input Method
          </label>

          <div className="grid grid-cols-3 gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setInputMode("text")} className={`p-3 rounded-xl border transition-all ${inputMode === "text" ? "border-cyan-400 bg-cyan-400/20 text-cyan-300" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>
              <Keyboard className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-semibold">Text</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInputMode("visual");
                onOpenColorPicker();
                setShowColorPicker(true);
              }}
              className={`p-3 rounded-xl border transition-all ${inputMode === "visual" ? "border-purple-400 bg-purple-400/20 text-purple-300" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              <Grid3x3 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-semibold">Visual</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInputMode("camera");
                setShowCamera(true);
                onOpenCamera();
              }}
              className={`p-3 rounded-xl border transition-all ${inputMode === "camera" ? "border-pink-400 bg-pink-400/20 text-pink-300" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              <Camera className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs font-semibold">Camera</span>
            </motion.button>
          </div>
        </div>

        {/* Puzzle Selector */}
        <div>
          <label className="block text-sm font-bold text-cyan-300 mb-2">Puzzle Type</label>
          <PuzzleSelector value={puzzleSize} onValueChange={setPuzzleSize} />
        </div>

        {/* Max Depth */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-cyan-300">Max Solution Length</label>
            <span className="text-lg font-bold text-white bg-cyan-400/20 px-3 py-1 rounded-lg">{maxDepth}</span>
          </div>
          <input type="range" min={5} max={20} value={maxDepth} onChange={(e) => setMaxDepth(+e.target.value)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>5</span>
            <span>20</span>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/80">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>

        {/* Advanced Settings - Allowed Moves */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow">
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-purple-300">Allowed Moves</label>
                  <span className="text-xs text-white/60">{selectedCount} selected (max 4)</span>
                </div>

                {Object.entries(moveGroups).map(([groupName, moves]) => (
                  <div key={groupName} className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs font-bold text-white/60 mb-2">{groupName}</div>
                    <div className="flex flex-wrap gap-2">
                      {moves.map((move) => {
                        const isSelected = allowedMoves[move];
                        const isDisabled = !isSelected && selectedCount >= 4;

                        return (
                          <motion.button key={move} whileHover={!isDisabled ? { scale: 1.1 } : {}} whileTap={!isDisabled ? { scale: 0.9 } : {}} disabled={isDisabled} onClick={() => toggleMove(move)} className={`px-4 py-2 rounded-lg font-mono font-bold text-sm transition-all ${isSelected ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "bg-white/10 text-white/60 hover:bg-white/20"} ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}>
                            {move}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSearching || !scrambleNotation.trim()} onClick={handleSearch} className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative  group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          <span className="relative flex items-center justify-center gap-2">
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find Solutions
                <Zap className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>

        {/* Info Text */}
        <p className="text-xs text-white/50 text-center">
          {inputMode === "text" && "Enter scramble notation or use visual input"}
          {inputMode === "visual" && "Click stickers to set cube state visually"}
          {inputMode === "camera" && "Use camera to scan your physical cube"}
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
                <CameraInput
                  onComplete={handleVisualInputComplete}
                  onCancel={() => {
                    onOpenCamera();
                    setShowCamera(false);
                  }}
                />
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
