import { useEffect, useState } from 'react';
import { useCubeStore } from '@/store/cubeStore';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function Timer() {
  const { 
    isTimerRunning,
    isInspecting,
    inspectionTime,
    currentTime,
    timerReady,
    scrambleNotation,
    sessions,
    currentSessionId,
    setTimerRunning,
    setInspecting,
    setInspectionTime,
    setCurrentTime,
    setTimerReady,
    addSolve,
    createSession,
    switchSession,
    deleteSession,
  } = useCubeStore();
  
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const solves = currentSession?.solves || [];

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTime(currentTime + 10);
      }, 10);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, currentTime, setCurrentTime]);

  // Inspection interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInspecting) {
      interval = setInterval(() => {
        setInspectionTime(inspectionTime - 1);
        
        if (inspectionTime === 8 || inspectionTime === 12) {
          // Audio beep (optional - can add audio element)
          console.log('Beep at', inspectionTime);
        }
        
        if (inspectionTime <= 0) {
          setInspecting(false);
          setTimerReady(true);
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isInspecting, inspectionTime, setInspecting, setInspectionTime, setTimerReady]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (isTimerRunning) {
          // Stop timer
          setTimerRunning(false);
          addSolve(currentTime, scrambleNotation);
        } else if (!isInspecting && !timerReady) {
          // Start hold timer
          const timer = setTimeout(() => {
            setTimerReady(true);
          }, 500);
          setHoldTimer(timer);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        
        if (holdTimer) {
          clearTimeout(holdTimer);
          setHoldTimer(null);
        }
        
        if (timerReady && !isTimerRunning) {
          // Start timer
          setCurrentTime(0);
          setTimerRunning(true);
          setTimerReady(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isTimerRunning, isInspecting, timerReady, holdTimer, currentTime, scrambleNotation, setTimerRunning, setCurrentTime, setTimerReady, addSolve]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const startInspection = () => {
    setInspectionTime(15);
    setInspecting(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setInspecting(false);
    setTimerReady(false);
    setCurrentTime(0);
    setInspectionTime(15);
  };

  const calculateAverage = (count: number) => {
    const validSolves = solves.filter(s => s.penalty !== 'DNF');
    const times = validSolves.map(s => s.time + (s.penalty === '+2' ? 2000 : 0));
    if (times.length < count) return null;
    const recent = times.slice(-count);
    if (count <= 3) {
      return formatTime(recent.reduce((a, b) => a + b, 0) / count);
    }
    const sorted = [...recent].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, -1);
    return formatTime(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName('');
      setSessionDialogOpen(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-6 glow">
      {/* Session Selector */}
      <div className="flex items-center gap-2">
        <Select value={currentSessionId} onValueChange={switchSession}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name} ({session.solves.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <TimerIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Session name"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
              />
              <Button onClick={handleCreateSession} className="w-full">
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Timer Display */}
      <div className="text-center space-y-4">
        {isInspecting ? (
          <div className="text-8xl font-bold text-primary font-mono">
            {inspectionTime}
          </div>
        ) : (
          <div 
            className={`text-6xl md:text-7xl font-bold font-mono tracking-tight transition-colors ${
              timerReady ? 'text-green-500' : isTimerRunning ? 'text-gradient' : 'text-foreground'
            }`}
          >
            {formatTime(currentTime)}
          </div>
        )}
        
        {/* Timer Controls */}
        <div className="flex justify-center gap-3">
          {!isTimerRunning && !isInspecting && (
            <Button
              onClick={startInspection}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <TimerIcon className="w-5 h-5 mr-2" />
              Start Inspection
            </Button>
          )}
          
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {!isTimerRunning && !isInspecting && (
          <div className="text-sm text-muted-foreground">
            Press and hold <kbd className="px-2 py-1 bg-muted rounded">SPACE</kbd> to arm timer
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {solves.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Best</div>
            <div className="text-lg font-semibold text-primary">
              {formatTime(Math.min(...solves.filter(s => s.penalty !== 'DNF').map(s => s.time)))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ao5</div>
            <div className="text-lg font-semibold text-secondary">
              {calculateAverage(5) || '—'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Solves</div>
            <div className="text-lg font-semibold text-foreground">
              {solves.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
