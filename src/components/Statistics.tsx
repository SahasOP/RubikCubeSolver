import { useCubeStore } from '@/store/cubeStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Statistics() {
  const { sessions, currentSessionId } = useCubeStore();
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const solves = currentSession?.solves || [];

  const validSolves = solves.filter(s => s.penalty !== 'DNF');
  const times = validSolves.map(s => s.time + (s.penalty === '+2' ? 2000 : 0));

  if (times.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">No solves yet. Start timing to see statistics!</p>
      </div>
    );
  }

  const calculateAverage = (count: number) => {
    if (times.length < count) return null;
    const recent = times.slice(-count);
    if (count <= 3) {
      return recent.reduce((a, b) => a + b, 0) / count;
    }
    const sorted = [...recent].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, -1);
    return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  };

  const best = Math.min(...times);
  const worst = Math.max(...times);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const ao5 = calculateAverage(5);
  const ao12 = calculateAverage(12);
  
  const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes > 0 ? minutes + ':' : ''}${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const chartData = times.slice(-50).map((time, index) => ({
    solve: index + 1,
    time: time / 1000,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Best</div>
            <div className="text-xl font-bold text-primary">{formatTime(best)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Worst</div>
            <div className="text-xl font-bold text-muted-foreground">{formatTime(worst)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Mean</div>
            <div className="text-xl font-bold text-foreground">{formatTime(mean)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ao5</div>
            <div className="text-xl font-bold text-secondary">
              {ao5 ? formatTime(ao5) : '—'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Ao12</div>
            <div className="text-xl font-bold text-secondary">
              {ao12 ? formatTime(ao12) : '—'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Std Dev</div>
            <div className="text-xl font-bold text-muted-foreground">
              {(stdDev / 1000).toFixed(2)}s
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {times.length >= 3 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Time Progression</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="solve" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
