import { useState, useMemo } from "react";
import { useCubeStore } from "@/store/cubeStore";
import { Button } from "@/components/ui/button";
import { Copy, Play, Check, ChevronDown, ListMusic, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SolutionsDisplayProps {
  setIsAutoPlay?: (value: boolean) => void;
  setPlayerKey?: (updater: (prev: number) => number) => void;
}

export function SolutionsDisplay({ setIsAutoPlay, setPlayerKey }: SolutionsDisplayProps) {
  const { solutions, setSolution } = useCubeStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Normalize and sort solutions by length
  const sortedData = useMemo(() => {
    const obj: Record<number, any[]> = solutions instanceof Map ? Object.fromEntries(solutions) : solutions || {};

    return Object.keys(obj)
      .map(Number)
      .filter((len) => !isNaN(len) && len > 0)
      .sort((a, b) => a - b)
      .map((len) => ({ length: len, algos: obj[len] }));
  }, [solutions]);

  const totalCount = sortedData.reduce((sum, item) => sum + item.algos.length, 0);
  const displayedData = showAll ? sortedData : sortedData.slice(0, 3);

  const handleCopy = (moves: string | string[], id: string) => {
    const text = Array.isArray(moves) ? moves.join(" ") : String(moves);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Algorithm copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlay = (moves: string | string[]) => {
    const moveStr = Array.isArray(moves) ? moves.join(" ") : String(moves);
    setSolution?.(moveStr);
    setIsAutoPlay?.(true);
    setPlayerKey?.((prev) => prev + 1);
  };

  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Sparkles className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-xs uppercase tracking-widest text-white/40">Waiting for search...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {sortedData.length > 3 && (
          <button onClick={() => setShowAll(!showAll)} className="text-[10px] uppercase tracking-wide text-cyan-400 hover:text-cyan-300 transition">
            {showAll ? "Collapse" : "View All"}
          </button>
        )}
      </div>

      {/* Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        <AnimatePresence mode="popLayout">
          {displayedData.map(({ length, algos }) => (
            <motion.div key={length} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {/* Length Divider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-cyan-400/60">{length} Moves</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Algorithms */}
              {algos.slice(0, 5).map((algo, idx) => {
                const id = `${length}-${idx}`;
                const moveStr = Array.isArray(algo?.moves) ? algo.moves.join(" ") : String(algo?.moves || "");

                return (
                  <motion.div key={id} layout className="group flex items-center justify-between px-3 py-2 rounded-lg bg-[#1A2138]/60 border border-white/5 hover:border-white/10 transition">
                    <code className="text-[11px] font-mono text-white/80 truncate pr-3">{moveStr}</code>

                    <div className="flex gap-1 shrink-0">
                      <Button onClick={() => handleCopy(algo?.moves, id)} variant="ghost" size="sm" className="h-7 w-7 rounded-md hover:bg-cyan-500/20">
                        {copiedId === id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/50" />}
                      </Button>

                      <Button onClick={() => handlePlay(algo?.moves)} variant="ghost" size="sm" className="h-7 w-7 rounded-md hover:bg-cyan-500/20">
                        <Play className="w-3 h-3 text-cyan-400" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
