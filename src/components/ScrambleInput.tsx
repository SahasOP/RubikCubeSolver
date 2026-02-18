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

        <Button onClick={generateRandomScramble} variant="outline" size="sm" className="h-7 px-2.5 text-xs border-white/10 hover:border-white/20">
          <Shuffle className="mr-1 h-3 w-3" />
          Random
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
        className="min-h-[44px] max-h-[160px] resize-none overflow-hidden rounded-xl border border-white/10 bg-[#1A2138] font-mono text-sm text-white placeholder:text-white/40 focus:border-cyan-500 focus:ring-0"
      />

      {/* Helper */}
      <p className="text-[11px] text-white/40">Use R, U, F, L, D, B • ' = CCW • 2 = 180°</p>
    </div>
  );
}
