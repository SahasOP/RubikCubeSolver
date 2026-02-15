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

const SpatialCard = ({ children, title, icon: Icon, className = "" }: PropsWithChildren<{ title?: string; icon?: any; className?: string }>) => (
  <motion.div variants={panelVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className={`relative group bg-slate-950/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-6 shadow-2xl ${className}`}>
    {/* Inner Glow Rim */}
    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

    {title && (
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{title}</h3>
      </div>
    )}
    <div className="relative z-10">{children}</div>
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
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic Background: "The Vapor Layer" */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div variants={glowVariants} animate="animate" className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full" />
        <motion.div variants={glowVariants} animate="animate" className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <main className=" mx-auto px-6 py-12 relative z-10">
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
          <div className="col-span-12 lg:col-span-7">
            <div className="relative group">
              {/* Dynamic Background Glow - contained within the column width */}
              <div className="absolute -inset-1 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              <SpatialCard className="flex flex-col !bg-black/40 !p-0 overflow-hidden border-white/5">
                {/* 1. Header Area: Integrated into the card top */}
                <div className="w-full p-6 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                    <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-slate-100">3D Visualization</h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-purple-300/60 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">{currentSolution ? `${currentSolution.split(" ").length} MOVES` : "IDLE"}</span>
                  </div>
                </div>

                {/* 2. Cube Viewport: Centered and Spacious */}
                <div className="flex-1 w-full relative flex items-center justify-center p-4">
                  {/* Subtle radial gradient to give the cube a "stage" */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)]" />

                  <div className="w-full relative z-10 flex items-center justify-center">
                    <CubePlayer key={playerKey} scramble={scrambleNotation} solution={currentSolution} puzzle={puzzleSize} tempoScale={1.5} controlPanel="bottom-row" visualization="3D" background="none" autoPlay={isAutoPlay} />
                  </div>
                </div>

                {/* 3. Footer Tip: Subtle instructional text */}
                <div className="p-4 bg-slate-900/40 border-t border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Use Mouse to Rotate • Scroll to Zoom</p>
                </div>
              </SpatialCard>
            </div>
            <SpatialCard title="Sequence Hub" icon={Layers} className="">
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
