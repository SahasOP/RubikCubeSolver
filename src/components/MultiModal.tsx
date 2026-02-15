import React, { useState, useRef, useEffect, PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Grid3x3, Palette, RotateCcw, Check, X, RefreshCw, Edit3, Save, Trash2 } from "lucide-react";
import { convertVisualStateToScramble } from "@/lib/visualSolver";
import { useCubeStore } from "@/store/cubeStore";

// --- Types & Constants ---
type CubeFace = "U" | "R" | "F" | "D" | "L" | "B";
type Color = "white" | "red" | "green" | "yellow" | "orange" | "blue";

const COLORS: Record<Color, string> = {
  white: "#FFFFFF",
  yellow: "#FFD500",
  red: "#EF4444",
  orange: "#F97316",
  green: "#22C55E",
  blue: "#3B82F6",
};

const FACE_NAMES: Record<CubeFace, string> = {
  U: "Top",
  R: "Right",
  F: "Front",
  D: "Bottom",
  L: "Left",
  B: "Back",
};

const SOLVED_FACE = (color: Color): Color[][] =>
  Array(3)
    .fill(null)
    .map(() => Array(3).fill(color));

// --- Main Unified Component ---
export const UnifiedCubeInput = ({ onComplete, onCancel }: { onComplete: (state: any) => void; onCancel: () => void }) => {
  const { setScramble } = useCubeStore();

  // State Management
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [currentFace, setCurrentFace] = useState<CubeFace>("U");
  const [selectedColor, setSelectedColor] = useState<Color>("white");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cubeState, setCubeState] = useState<Record<CubeFace, Color[][]>>({
    U: SOLVED_FACE("white"),
    R: SOLVED_FACE("red"),
    F: SOLVED_FACE("green"),
    D: SOLVED_FACE("yellow"),
    L: SOLVED_FACE("orange"),
    B: SOLVED_FACE("blue"),
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Camera Initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeTab === "camera") {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      });
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [activeTab]);

  // Handle Manual Sticker Click
  const handleStickerClick = (r: number, c: number) => {
    const newState = { ...cubeState };
    newState[currentFace][r] = [...newState[currentFace][r]];
    newState[currentFace][r][c] = selectedColor;
    setCubeState(newState);
  };

  // Simplified Detection Placeholder (Integrate your sampleCell logic here)
  const captureAndAnalyze = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Logic to read from canvas and update currentFace in cubeState
      setIsProcessing(false);
      setActiveTab("manual"); // Switch to manual so user can verify
    }, 800);
  };

  const handleFinalSubmit = () => {
    try {
      // Formats the state for your existing visualSolver
      const formattedFaces = Object.entries(cubeState).map(([face, colors]) => ({
        face: face as CubeFace,
        colors,
      }));
      const scramble = convertVisualStateToScramble(formattedFaces);
      setScramble(scramble);
      onComplete(cubeState);
    } catch (err) {
      alert("Invalid Cube: Please check that all centers match and colors are balanced.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Centering logic: fixed inset-0 + flex items-center justify-center
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl p-4 md:p-8"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900/80 border border-white/10 rounded-[3rem] w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.8)] relative"
      >
        {/* Left: Spatial Progress Sidebar */}
        <div className="w-24 md:w-72 border-r border-white/5 bg-black/20 p-4 md:p-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_cyan]" />
              <span className="hidden md:block text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">Input Hub</span>
            </div>

            <div className="space-y-3">
              {(Object.keys(FACE_NAMES) as CubeFace[]).map((face) => (
                <button key={face} onClick={() => setCurrentFace(face)} className={`w-full p-3 md:p-4 rounded-2xl flex items-center justify-between transition-all border ${currentFace === face ? "bg-cyan-500/10 border-cyan-500/40 text-white" : "border-transparent text-slate-500 hover:bg-white/5"}`}>
                  <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">{FACE_NAMES[face]}</span>
                  <div className="w-6 h-6 rounded-lg border border-black/40 shadow-inner" style={{ backgroundColor: COLORS[cubeState[face][1][1]] }} />
                </button>
              ))}
            </div>
          </div>
          <button onClick={onCancel} className="p-4 text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <Trash2 size={18} /> <span className="hidden md:block text-[10px] font-bold uppercase">Cancel</span>
          </button>
        </div>

        {/* Right: Interaction Viewport */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] -z-10" />

          {/* Top Bar: Interaction Switcher */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
            <div className="flex bg-slate-950/80 rounded-2xl p-1 border border-white/5">
              <button onClick={() => setActiveTab("camera")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "camera" ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}>
                <Camera size={14} /> Scan
              </button>
              <button onClick={() => setActiveTab("manual")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === "manual" ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}>
                <Grid3x3 size={14} /> Edit
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Active: {FACE_NAMES[currentFace]}</span>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-12 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full items-center">
              {/* Center: Input Viewport */}
              <div className="lg:col-span-7 flex justify-center">
                <AnimatePresence mode="wait">
                  {activeTab === "camera" ? (
                    <motion.div key="cam" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-[450px] aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2]" />
                      <div className="absolute inset-0 border-[60px] border-slate-950/60 pointer-events-none" />
                      <div className="absolute inset-x-20 inset-y-20 border-2 border-dashed border-cyan-400/40 rounded-3xl animate-pulse" />
                      <button onClick={captureAndAnalyze} className="absolute bottom-8 left-1/2 -translate-x-1/2 px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                        {isProcessing ? "Processing..." : "Capture Face"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4 p-8 bg-black/40 rounded-[3.5rem] border border-white/5 shadow-inner">
                      {cubeState[currentFace].map((row, r) => row.map((color, c) => <motion.button key={`${r}-${c}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleStickerClick(r, c)} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-black/40 shadow-xl transition-colors" style={{ backgroundColor: COLORS[color] }} />))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Tools Panel */}
              <div className="lg:col-span-5 space-y-8">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sticker Palette</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(Object.entries(COLORS) as [Color, string][]).map(([color, hex]) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`group p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedColor === color ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/5 bg-white/5 hover:bg-white/10"}`}>
                        <div className="w-8 h-8 rounded-lg shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: hex }} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl">
                    <RotateCcw className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase">Reset Active Face</p>
                    <p className="text-[10px] text-slate-500 mt-1">Revert {FACE_NAMES[currentFace]} to default</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center">
            <p className="hidden md:block text-[10px] font-medium text-slate-500 tracking-wider">TOTAL 54 STICKERS • BIPARTITE VALIDATION ACTIVE</p>
            <div className="flex gap-4 w-full md:w-auto">
              <button onClick={onCancel} className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors">
                Discard
              </button>
              <button onClick={handleFinalSubmit} className="flex-1 md:flex-none px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
                Sync & Solve
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
