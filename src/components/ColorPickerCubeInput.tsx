// src/components/ColorPickerCubeInput.tsx
// Visual cube state editor with color picking

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image, Grid3x3, Palette, RotateCcw, Check, X } from "lucide-react";

type CubeFace = "U" | "R" | "F" | "D" | "L" | "B";
type Color = "white" | "red" | "green" | "yellow" | "orange" | "blue";

interface CubeState {
  U: Color[][]; // Up (white)
  R: Color[][]; // Right (red)
  F: Color[][]; // Front (green)
  D: Color[][]; // Down (yellow)
  L: Color[][]; // Left (orange)
  B: Color[][]; // Back (blue)
}

const COLORS: { [key in Color]: string } = {
  white: "#FFFFFF",
  yellow: "#FFD500",
  red: "#EF4444",
  orange: "#F97316",
  green: "#22C55E",
  blue: "#3B82F6",
};

const COLOR_NAMES: { [key in Color]: string } = {
  white: "White",
  yellow: "Yellow",
  red: "Red",
  orange: "Orange",
  green: "Green",
  blue: "Blue",
};

const SOLVED_STATE: CubeState = {
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

interface ColorPickerCubeInputProps {
  onComplete: (cubeState: CubeState) => void;
  onCancel: () => void;
}
const getNearestColor = (hex: string): Color => {
  const entries = Object.entries(COLORS) as [Color, string][];
  const toRgb = (h: string) => h.match(/\w\w/g)!.map((x) => parseInt(x, 16));

  const [r, g, b] = toRgb(hex.replace("#", ""));

  let best: Color = "white";
  let min = Infinity;

  for (const [color, value] of entries) {
    const [cr, cg, cb] = toRgb(value.replace("#", ""));
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < min) {
      min = dist;
      best = color;
    }
  }
  return best;
};

export const ColorPickerCubeInput = ({ onComplete, onCancel }: ColorPickerCubeInputProps) => {
  const [cubeState, setCubeState] = useState<CubeState>(JSON.parse(JSON.stringify(SOLVED_STATE)));
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [activeFace, setActiveFace] = useState<CubeFace>("U");
  const [fillMode, setFillMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    face: CubeFace;
    row: number;
    col: number;
  } | null>(null);

  const handleStickerClick = (face: CubeFace, row: number, col: number) => {
    setCubeState((prev) => {
      const newState = { ...prev };
      const newFace = [...prev[face]];
      const newRow = [...newFace[row]];
      newRow[col] = selectedColor;
      newFace[row] = newRow;
      newState[face] = newFace;
      return newState;
    });
  };

  const fillFace = (face: CubeFace, color: Color) => {
    setCubeState((prev) => ({
      ...prev,
      [face]: [
        [color, color, color],
        [color, color, color],
        [color, color, color],
      ],
    }));
  };

  const resetCube = () => {
    setCubeState(JSON.parse(JSON.stringify(SOLVED_STATE)));
  };

  const validateCube = (): { valid: boolean; message: string } => {
    // Count each color
    const colorCounts: { [key in Color]: number } = {
      white: 0,
      yellow: 0,
      red: 0,
      orange: 0,
      green: 0,
      blue: 0,
    };

    Object.values(cubeState).forEach((face) => {
      face.forEach((row) => {
        row.forEach((color) => {
          colorCounts[color]++;
        });
      });
    });

    // Each color should appear exactly 9 times
    for (const [color, count] of Object.entries(colorCounts)) {
      if (count !== 9) {
        return {
          valid: false,
          message: `Invalid: ${COLOR_NAMES[color as Color]} appears ${count} times (should be 9)`,
        };
      }
    }

    return { valid: true, message: "Cube state is valid!" };
  };

  const handleComplete = () => {
    const validation = validateCube();
    if (validation.valid) {
      onComplete(cubeState);
    } else {
      alert(validation.message);
    }
  };

  const FACE_LAYOUT = {
    U: { name: "Top", row: 0, col: 1 },
    L: { name: "Left", row: 1, col: 0 },
    F: { name: "Front", row: 1, col: 1 },
    R: { name: "Right", row: 1, col: 2 },
    B: { name: "Back", row: 1, col: 3 },
    D: { name: "Bottom", row: 2, col: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ minHeight: "100vh", minWidth: "100vw" }}>
        <div
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto flex flex-col"
          style={{
            boxSizing: "border-box",
            padding: "0",
            margin: "0 1rem",
          }}
        >
          {/* Header */}
          <div
            className="p-6 border-b border-white/10 sticky top-0 bg-slate-900/90 z-10000
"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Visual Cube Input</h2>
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>
            <p className="text-white/60">Click stickers to set their color. Each color must appear exactly 9 times.</p>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Palette */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  Color Palette
                </h3>

                <div className="space-y-2">
                  {(Object.entries(COLORS) as [Color, string][]).map(([color, hex]) => {
                    const count = Object.values(cubeState).reduce((sum, face) => sum + face.flat().filter((c) => c === color).length, 0);

                    return (
                      <motion.button key={color} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedColor(color)} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${selectedColor === color ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/30" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border-2 border-black/20 shadow-lg" style={{ backgroundColor: hex }} />
                          <span className="font-semibold text-white">{COLOR_NAMES[color]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-mono ${count === 9 ? "text-green-400" : count > 9 ? "text-red-400" : "text-yellow-400"}`}>{count}/9</span>
                          {count === 9 && <Check className="w-4 h-4 text-green-400" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-white/80">Quick Actions</h4>
                  <button onClick={resetCube} className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset to Solved
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <input type="checkbox" checked={fillMode} onChange={(e) => setFillMode(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-white/80">Fill Mode (click face name)</span>
                  </label>
                </div>
              </div>

              {/* Cube Net Display */}
              <div className="lg:col-span-2 min-w-[320px]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-purple-400" />
                  Cube Layout
                </h3>
                <div className="inline-block bg-black/40 p-4 rounded-2xl overflow-x-auto">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                      minWidth: "320px",
                    }}
                  >
                    {(Object.entries(FACE_LAYOUT) as [CubeFace, typeof FACE_LAYOUT.U][]).map(([face, layout]) => (
                      <div
                        key={face}
                        style={{
                          gridRow: layout.row + 1,
                          gridColumn: layout.col + 1,
                        }}
                        className="space-y-1"
                      >
                        {/* Face name */}
                        <button
                          onClick={() => fillMode && fillFace(face, selectedColor)}
                          className={`text-xs font-bold mb-1 px-2 py-1 rounded transition-colors
              ${activeFace === face ? "bg-cyan-400 text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                        >
                          {layout.name}
                        </button>
                        {/* 3x3 stickers */}
                        <div className="grid grid-cols-3 gap-1">
                          {cubeState[face].map((row, rowIdx) =>
                            row.map((color, colIdx) => (
                              <motion.button
                                key={`${face}-${rowIdx}-${colIdx}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStickerClick(face, rowIdx, colIdx)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setEditingCell({ face, row: rowIdx, col: colIdx });
                                }}
                                onMouseEnter={() => setActiveFace(face)}
                                className="relative w-10 h-10 rounded
                    border-2 border-black/30 shadow-lg"
                                style={{ backgroundColor: COLORS[color] }}
                              >
                                {/* Manual color picker */}
                                {editingCell && editingCell.face === face && editingCell.row === rowIdx && editingCell.col === colIdx && (
                                  <input
                                    type="color"
                                    autoFocus
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onBlur={() => setEditingCell(null)}
                                    onChange={(e) => {
                                      const newColor = getNearestColor(e.target.value);
                                      setSelectedColor(newColor);
                                      handleStickerClick(face, rowIdx, colIdx);
                                      setEditingCell(null);
                                    }}
                                  />
                                )}
                              </motion.button>
                            )),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-300 mb-2">How to use:</h4>
                  <ul className="text-xs text-white/70 space-y-1">
                    <li>• Select a color from the palette</li>
                    <li>• Click stickers to set their color</li>
                    <li>• Enable Fill Mode to fill entire faces</li>
                    <li>• Each color must appear exactly 9 times</li>
                    <li>• Center stickers should match the face color</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 border-t border-white/10 bg-slate-900 sticky bottom-0 ">
            <button onClick={onCancel} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleComplete} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all">
              Generate Scramble
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
