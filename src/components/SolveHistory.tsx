import { useCubeStore, SolveRecord } from '@/store/cubeStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Download } from 'lucide-react';
import { toast } from 'sonner';

export function SolveHistory() {
  const { sessions, currentSessionId, updateSolve, deleteSolve } = useCubeStore();
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const solves = [...(currentSession?.solves || [])].reverse();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes > 0 ? minutes + ':' : ''}${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBestTime = () => {
    const validSolves = solves.filter(s => s.penalty !== 'DNF');
    if (validSolves.length === 0) return Infinity;
    return Math.min(...validSolves.map(s => s.time + (s.penalty === '+2' ? 2000 : 0)));
  };

  const bestTime = getBestTime();

  const handleAddPenalty = (solve: SolveRecord) => {
    if (solve.penalty === '+2') {
      updateSolve(solve.id, { penalty: undefined });
      toast.info('Penalty removed');
    } else {
      updateSolve(solve.id, { penalty: '+2' });
      toast.info('+2 penalty added');
    }
  };

  const handleMarkDNF = (solve: SolveRecord) => {
    if (solve.penalty === 'DNF') {
      updateSolve(solve.id, { penalty: undefined });
      toast.info('DNF removed');
    } else {
      updateSolve(solve.id, { penalty: 'DNF' });
      toast.info('Marked as DNF');
    }
  };

  const handleDelete = (solve: SolveRecord) => {
    deleteSolve(solve.id);
    toast.success('Solve deleted');
  };

  const handleExportCSV = () => {
    const csv = [
      ['#', 'Time', 'Penalty', 'Scramble', 'Date'],
      ...solves.map((solve, i) => [
        (solves.length - i).toString(),
        formatTime(solve.time),
        solve.penalty || '',
        solve.scramble,
        formatDate(solve.date),
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cube-solves-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('History exported');
  };

  if (solves.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">No solve history yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Solve History</h3>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="border-primary/50 hover:bg-primary/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="hidden md:table-cell">Scramble</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solves.map((solve, index) => {
              const displayTime = solve.penalty === 'DNF' 
                ? 'DNF' 
                : formatTime(solve.time + (solve.penalty === '+2' ? 2000 : 0));
              const isPersonalBest = !solve.penalty && solve.time === bestTime;

              return (
                <TableRow
                  key={solve.id}
                  className={isPersonalBest ? 'bg-primary/10' : ''}
                >
                  <TableCell className="font-medium">{solves.length - index}</TableCell>
                  <TableCell className="font-mono">
                    {displayTime}
                    {solve.penalty === '+2' && (
                      <span className="text-xs text-yellow-500 ml-1">+2</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                    {solve.scramble}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {formatDate(solve.date)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAddPenalty(solve)}>
                          {solve.penalty === '+2' ? 'Remove' : 'Add'} +2
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkDNF(solve)}>
                          {solve.penalty === 'DNF' ? 'Remove' : 'Mark as'} DNF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(solve)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
