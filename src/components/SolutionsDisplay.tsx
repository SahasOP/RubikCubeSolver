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
      <div className="h-full flex flex-col items-center justify-center p-8 border border-white/5 rounded-[2.5rem] bg-slate-950/40 backdrop-blur-3xl">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
          <Sparkles className="w-8 h-8 text-slate-500" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 text-center">Waiting for search...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <ListMusic className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-100">Optimal Paths</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{totalCount} Found</p>
          </div>
        </div>

        {sortedData.length > 3 && (
          <button onClick={() => setShowAll(!showAll)} className="text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
            {showAll ? "Collapse" : "View All"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {displayedData.map(({ length, algos }) => (
            <motion.div key={length} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-black text-cyan-500/50 uppercase tracking-tighter">{length} Moves</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {algos.slice(0, 5).map((algo, idx) => {
                const id = `${length}-${idx}`;
                const moveStr = Array.isArray(algo?.moves) ? algo.moves.join(" ") : String(algo?.moves || "");

                return (
                  <motion.div key={id} whileHover={{ x: 4 }} className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                    <code className="text-[11px] font-mono text-slate-300 truncate pr-4">{moveStr}</code>
                    <div className="flex gap-1 shrink-0">
                      <Button onClick={() => handleCopy(algo?.moves, id)} variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-cyan-500/20">
                        {copiedId === id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </Button>
                      <Button onClick={() => handlePlay(algo?.moves)} variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-cyan-500/20">
                        <Play className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
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
