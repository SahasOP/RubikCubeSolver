import { useEffect, useState, PropsWithChildren } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Sparkles, Zap, Target, Layers, Play, RotateCcw, ChevronRight } from "lucide-react";
import { CubePlayer } from "@/components/CubePlayer";
import { ScrambleInput } from "@/components/ScrambleInput";
import { SearchSettings } from "@/components/SearchSettings";
import { SolutionsDisplay } from "@/components/SolutionsDisplay";
import { useCubeStore } from "@/store/cubeStore";

/* ---------------- High-End Animation Variants ---------------- */

const fujiSpring = { type: "spring", stiffness: 120, damping: 20 };

const panelVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...fujiSpring, delayChildren: 0.3, staggerChildren: 0.1 },
  },
};

const glowVariants = {
  animate: {
    opacity: [0.4, 0.7, 0.4],
    scale: [1, 1.1, 1],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ---------------- New-Gen Glass Component ---------------- */
const SpatialCard = ({
  children,
  title,
  icon: Icon,
  className = "",
}: PropsWithChildren<{
  title?: string;
  icon?: any;
  className?: string;
}>) => (
  <motion.div variants={panelVariants} whileHover={{ y: -2 }} className={`rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-md ${className}`}>
    {title && (
      <div className="mb-5 flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">{title}</h3>
      </div>
    )}

    {children}
  </motion.div>
);

/* ---------------- Main Immersive Layout ---------------- */

const Index = () => {
  const { scrambleNotation, currentSolution, isSearching, error, setSolutions, setSolution } = useCubeStore();
  const [puzzleSize, setPuzzleSize] = useState("3x3x3");
  const [playerKey, setPlayerKey] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (!scrambleNotation) return;
    setPlayerKey((k) => k + 1);
    setIsAutoPlay(false);
    setSolutions([]);
    setSolution("");
  }, [scrambleNotation, setSolutions, setSolution]);

  return (
    <div className="  bg-[#020617] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic Background: "The Vapor Layer" */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div variants={glowVariants} animate="animate" className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full" />
        <motion.div variants={glowVariants} animate="animate" className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <main className=" mx-auto px-6 py-6 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={panelVariants} className="grid grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="col-span-12 lg:col-span-5 space-y-8">
            <SpatialCard title="Configuration" icon={Target}>
              <ScrambleInput />
            </SpatialCard>

            <SpatialCard title="Optimization" icon={Zap}>
              <SearchSettings puzzleSize={puzzleSize} setPuzzleSize={setPuzzleSize} onOpenColorPicker={() => setShowColorPicker(true)} onOpenCamera={() => setShowCamera(true)} />
            </SpatialCard>

            <AnimatePresence>
              {isSearching && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-bold tracking-widest uppercase">Analyzing Nodes...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Core Visualization Column */}
          <div className="col-span-12 lg:col-span-7 space-y-5">
            {/* 3D Visualization */}
            <SpatialCard className="overflow-hidden border-white/10 bg-[#0F172A] p-0">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 ">
                <div className="flex items-center gap-2">
                  <motion.div className="w-2 h-2 rounded-full bg-cyan-400" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-white/70">3D Visualization</h3>
                </div>

                <span className="text-[10px] font-mono text-purple-300/70 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{currentSolution ? `${currentSolution.split(" ").length} MOVES` : "IDLE"}</span>
              </div>

              {/* Cube Viewport */}
              <div className="relative flex items-center justify-center p-2 min-h-[400px]">
                <CubePlayer key={playerKey} scramble={scrambleNotation} solution={currentSolution} puzzle={puzzleSize} tempoScale={1.5} controlPanel="none" visualization="3D" background="none" autoPlay={isAutoPlay} />
              </div>

              {/* Footer */}
              {/* <div className="border-t border-white/5 py-0 text-center">
                <p className="text-[10px] text-white/40 tracking-wide">Drag to Rotate • Scroll to Zoom</p>
              </div> */}
            </SpatialCard>

            {/* Sequence Hub */}
            <SpatialCard title="Solutions" icon={Layers} className="flex flex-col h-[300px]">
              <SolutionsDisplay setIsAutoPlay={setIsAutoPlay} setPlayerKey={setPlayerKey} isAutoPlay={isAutoPlay} />
            </SpatialCard>
          </div>

          {/* Solutions Column */}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
