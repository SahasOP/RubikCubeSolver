import { useCubeStore } from "@/store/cubeStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shuffle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ScrambleInput() {
  const { scrambleNotation, setScramble, generateRandomScramble } = useCubeStore();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
          Scramble Notation
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-white/40 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="max-w-xs text-xs">Standard notation: R, U, F, L, D, B | Add ' for CCW, 2 for 180°</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>

        <Button onClick={generateRandomScramble} variant="ghost" size="sm" className="h-8 px-4 text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:scale-105 hover:text-cyan-300 transition-all rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Shuffle className="mr-1.5 h-3.5 w-3.5" />
          Randomize
        </Button>
      </div>

      {/* Textarea */}
      <Textarea
        value={scrambleNotation}
        onChange={(e) => {
          setScramble(e.target.value);

          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        rows={1}
        placeholder="R U R' U' F2 D L2 B2..."
        className="min-h-[44px] max-h-[160px] resize-none overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl font-mono text-sm text-cyan-50 shadow-inner placeholder:text-white/30 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all p-3 leading-relaxed"
      />

      {/* Helper */}
      <p className="text-[11px] text-white/40">Use R, U, F, L, D, B • ' = CCW • 2 = 180°</p>
    </div>
  );
}
