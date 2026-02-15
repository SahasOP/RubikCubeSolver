// src/components/AlgorithmCard.tsx
// Interactive algorithm card with cubing.js visualization

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Copy, Check, BookOpen, Zap, Star } from "lucide-react";
import { Algorithm } from "../types/learning";
import { Alg } from "cubing/alg";

interface AlgorithmCardProps {
  algorithm: Algorithm;
  onMaster?: (id: string) => void;
  isMastered?: boolean;
}

export const AlgorithmCard = ({ algorithm, onMaster, isMastered = false }: AlgorithmCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const cubeRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Initialize cube visualization
  useEffect(() => {
    if (!cubeRef.current) return;

    cubeRef.current.innerHTML = "";

    const alg = algorithm.algorithm;
    const inverseAlg = new Alg(alg).invert().toString();
    const player = document.createElement("twisty-player");
    player.setAttribute("puzzle", "3x3x3");
    player.setAttribute("experimental-setup-alg", inverseAlg);
    player.setAttribute("alg", alg);
    player.setAttribute("background", "none");
    player.setAttribute("control-panel", "none");
    player.setAttribute("visualization", "3D");

    player.style.width = "100%";
    player.style.height = "200px";

    cubeRef.current.appendChild(player);
    playerRef.current = player;
  }, [algorithm.algorithm]);

  const handlePlay = async () => {
    if (!playerRef.current || isPlaying) return;

    setIsPlaying(true);

    try {
      // Reset cube
      const inverseAlg = new Alg(algorithm.algorithm).invert().toString();
      await playerRef.current.setAttribute("experimental-setup-alg", inverseAlg);
      await playerRef.current.setAttribute("alg", algorithm.algorithm);

      // Play animation
      await playerRef.current.play();
    } catch (e) {
      console.error(e);
    }

    setIsPlaying(false);
  };

  const handleReset = () => {
    if (!cubeRef.current) return;

    // Remove old player
    cubeRef.current.innerHTML = "";

    // Create fresh player
    const player = document.createElement("twisty-player");

    const alg = algorithm.algorithm;
    const inverseAlg = new Alg(alg).invert().toString();

    player.setAttribute("puzzle", "3x3x3");
    player.setAttribute("setup-alg", inverseAlg);
    player.setAttribute("alg", alg);

    player.setAttribute("background", "none");
    player.setAttribute("control-panel", "none");
    player.setAttribute("visualization", "3D");
    player.setAttribute("speed", "2");

    player.style.width = "100%";
    player.style.height = "200px";

    cubeRef.current.appendChild(player);
    playerRef.current = player;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(algorithm.algorithm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors = {
    beginner: "from-green-400 to-emerald-500",
    intermediate: "from-yellow-400 to-orange-500",
    advanced: "from-orange-400 to-red-500",
    expert: "from-red-400 to-rose-500",
  };

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-white/5 to-transparent border-b border-white/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{algorithm.name}</h3>
            <p className="text-sm text-white/60">{algorithm.description}</p>
          </div>

          <motion.button whileHover={{ scale: 1.1, rotate: 72 }} whileTap={{ scale: 0.9 }} onClick={() => onMaster?.(algorithm.id)} className={`p-2 rounded-lg transition-colors ${isMastered ? "bg-yellow-400/20 text-yellow-400" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            <Star className={`w-5 h-5 ${isMastered ? "fill-yellow-400" : ""}`} />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${difficultyColors[algorithm.difficulty]} text-white shadow-lg`}>{algorithm.difficulty}</span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white/80">{algorithm.category}</span>
          {algorithm.averageMoves && <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{algorithm.averageMoves} moves</span>}
        </div>
      </div>

      {/* 3D Cube Visualization */}
      <div className="relative bg-black/40">
        <div ref={cubeRef} className="w-full" />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>

      {/* Algorithm Display */}
      <div className="p-6 bg-gradient-to-br from-black/20 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Algorithm</h4>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 transition-colors">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </motion.button>
        </div>

        <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/10">
          <code className="text-lg font-mono text-cyan-300 tracking-wider">{algorithm.algorithm}</code>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePlay} disabled={isPlaying} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed">
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Playing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleReset} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </motion.button>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDetails(!showDetails)} className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors">
            <BookOpen className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-white/10">
            <div className="p-6 bg-gradient-to-br from-white/5 to-transparent space-y-4">
              {/* Tips */}
              {algorithm.tips && algorithm.tips.length > 0 && (
                <div>
                  <h5 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Tips
                  </h5>
                  <ul className="space-y-2">
                    {algorithm.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-white/70 flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recognition Tips */}
              {algorithm.recognitionTips && (
                <div>
                  <h5 className="text-sm font-bold text-yellow-300 mb-2">Recognition</h5>
                  <p className="text-sm text-white/70">{algorithm.recognitionTips}</p>
                </div>
              )}

              {/* Alternatives */}
              {algorithm.alternatives && algorithm.alternatives.length > 0 && (
                <div>
                  <h5 className="text-sm font-bold text-green-300 mb-2">Alternative Algorithms</h5>
                  <div className="space-y-2">
                    {algorithm.alternatives.map((alt, index) => (
                      <code key={index} className="block text-sm font-mono text-white/60 bg-black/30 rounded p-2">
                        {alt}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
