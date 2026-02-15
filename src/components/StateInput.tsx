import { useCubeStore, CubeColor } from '@/store/cubeStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS: { name: CubeColor; hex: string; label: string }[] = [
  { name: 'white', hex: '#FFFFFF', label: 'White' },
  { name: 'yellow', hex: '#FFD700', label: 'Yellow' },
  { name: 'red', hex: '#EF4444', label: 'Red' },
  { name: 'orange', hex: '#F97316', label: 'Orange' },
  { name: 'blue', hex: '#3B82F6', label: 'Blue' },
  { name: 'green', hex: '#10B981', label: 'Green' },
];

const FACES = [
  { id: 'U', label: 'U (Top)', start: 36 },
  { id: 'D', label: 'D (Bot)', start: 45 },
  { id: 'F', label: 'F (Front)', start: 0 },
  { id: 'B', label: 'B (Back)', start: 9 },
  { id: 'L', label: 'L (Left)', start: 18 },
  { id: 'R', label: 'R (Right)', start: 27 },
];

interface StateInputProps {
  type: 'start' | 'goal';
  title: string;
}

export function StateInput({ type, title }: StateInputProps) {
  const {
    startState,
    goalState,
    setStartSticker,
    setGoalSticker,
    resetStartState,
    resetGoalState,
    setSolvedGoalState,
  } = useCubeStore();

  const state = type === 'start' ? startState : goalState;
  const setSticker = type === 'start' ? setStartSticker : setGoalSticker;
  const resetState = type === 'start' ? resetStartState : resetGoalState;

  const cycleColor = (index: number) => {
    const currentColor = state[index];
    const currentIndex = COLORS.findIndex((c) => c.name === currentColor);
    const nextIndex = (currentIndex + 1) % COLORS.length;
    setSticker(index, COLORS[nextIndex].name);
  };

  return (
    <div className="bg-card rounded-lg p-4 card-shadow border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <div className="flex gap-2">
          {type === 'goal' && (
            <Button
              onClick={setSolvedGoalState}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Solved State
            </Button>
          )}
          <Button
            onClick={resetState}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Color Legend */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {COLORS.map((color) => (
          <div
            key={color.name}
            className="flex items-center justify-center p-1 rounded border border-border"
            style={{ backgroundColor: color.hex }}
            title={color.label}
          >
            <span className="text-[10px] font-medium text-foreground mix-blend-difference">
              {color.label[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Face Tabs */}
      <Tabs defaultValue="U" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-8">
          {FACES.map((face) => (
            <TabsTrigger key={face.id} value={face.id} className="text-xs py-1">
              {face.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {FACES.map((face) => (
          <TabsContent key={face.id} value={face.id} className="mt-3">
            <div className="grid grid-cols-3 gap-1 w-full max-w-[180px] mx-auto">
              {Array.from({ length: 9 }).map((_, i) => {
                const stickerIndex = face.start + i;
                const color = state[stickerIndex];
                const colorInfo = COLORS.find((c) => c.name === color);

                return (
                  <button
                    key={i}
                    onClick={() => cycleColor(stickerIndex)}
                    className="aspect-square rounded border-2 border-border hover:border-primary transition-all"
                    style={{ backgroundColor: colorInfo?.hex || '#E5E7EB' }}
                    title={`Click to change (${colorInfo?.label || 'Unknown'})`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Click any sticker to cycle colors
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
