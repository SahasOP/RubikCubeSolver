import { useCubeStore } from '@/store/cubeStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shuffle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ScrambleInput() {
  const { scrambleNotation, setScramble, generateRandomScramble } = useCubeStore();

  return (
    <div className="bg-card rounded-xl p-4 card-shadow border-2 border-border space-y-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-foreground flex items-center gap-2">
          Scramble Notation
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">Standard notation: R, U, F, L, D, B | Add ' for CCW, 2 for 180°</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <Button
          onClick={generateRandomScramble}
          variant="outline"
          size="sm"
          className="text-xs h-7"
        >
          <Shuffle className="w-3 h-3 mr-1" />
          Random
        </Button>
      </div>

      <Textarea
        value={scrambleNotation}
        onChange={(e) => setScramble(e.target.value)}
        placeholder="R U R' U' F2 D L2 B2..."
        className="resize-none h-20 font-mono text-sm bg-secondary/50 border-2"
      />

      <p className="text-xs text-muted-foreground">
        Enter moves using R, U, F, L, D, B • Use ' for counter-clockwise • Use 2 for 180°
      </p>
    </div>
  );
}
