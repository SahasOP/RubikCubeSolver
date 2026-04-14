import React, { useState, useEffect } from "react";
import { Eye, ArrowRight, Play, Check, X, RotateCcw, Award } from "lucide-react";
import { CubePlayer } from "./CubePlayer";
import { ALGORITHMS } from "../data/algorithms";
import { Algorithm } from "../types/learning";

/**
 * Utility to compute the inverse of a sequence of moves.
 * E.g. "R U R' U'" -> "U R U' R'"
 */
export function getInverseAlgorithm(alg: string): string {
  const moves = alg.split(" ").filter((m) => m.trim() !== "");
  return moves
    .reverse()
    .map((m) => {
      if (m.endsWith("'")) return m[0];
      if (m.endsWith("2")) return m;
      return m + "'";
    })
    .join(" ");
}

/* =========================================
   Algorithm Drill Mode (Flashcards)
   ========================================= */
export function AlgorithmDrillMode({ onExit }: { onExit: () => void }) {
  const [currentAlg, setCurrentAlg] = useState<Algorithm | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [key, setKey] = useState(0); // forces CubePlayer remount
  
  useEffect(() => {
    pickRandomAlg();
  }, []);

  const pickRandomAlg = () => {
    const randomIndex = Math.floor(Math.random() * ALGORITHMS.length);
    setCurrentAlg(ALGORITHMS[randomIndex]);
    setIsRevealed(false);
    setKey(k => k + 1);
  };

  if (!currentAlg) return null;

  const setupMoves = getInverseAlgorithm(currentAlg.algorithm);

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto w-full py-8">
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={onExit} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors flex items-center gap-2 border border-white/10">
          ← Exit Drill
        </button>
        <span className="px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm font-bold uppercase tracking-widest">
          Flashcard Drill
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Cube Visualization */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Target State</h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/70">{currentAlg.category}</span>
          </div>
          <div className="bg-black/40 rounded-2xl p-2 relative flex-grow flex items-center justify-center overflow-hidden min-h-[400px]">
             <CubePlayer key={key} scramble={setupMoves} solution={currentAlg.algorithm} controlPanel={isRevealed ? "bottom-row" : "none"} autoPlay={isRevealed} puzzle="3x3x3" visualization="3D" background="none" />
          </div>
        </div>

        {/* Info & Controls */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
              <RotateCcw className="w-32 h-32 text-cyan-400 translate-x-8 -translate-y-8" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 relative z-10">{currentAlg.name}</h2>
            <p className="text-slate-400 mb-6 relative z-10">{currentAlg.description}</p>
            
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-1">Setup Moves (Scramble your cube with this)</p>
                <div className="bg-black/30 px-4 py-3 rounded-xl font-mono text-cyan-400 border border-white/5 select-all">
                  {setupMoves}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-1">Algorithm to Solve</p>
                <div className={`px-4 py-3 rounded-xl font-mono text-lg border transition-all duration-300 ${isRevealed ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/40 text-white font-bold' : 'bg-black/30 border-white/5 text-transparent blur-[6px] select-none'}`}>
                  {currentAlg.algorithm}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 relative z-10">
              {!isRevealed ? (
                <button
                  onClick={() => setIsRevealed(true)}
                  className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Reveal Solution
                </button>
              ) : (
                <button
                  onClick={pickRandomAlg}
                  className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Next Flashcard
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   Timed Challenge Mode
   ========================================= */
export function TimedChallengeMode({ onExit }: { onExit: () => void }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState(0);
  const [key, setKey] = useState(0);
  
  const [currentAlg, setCurrentAlg] = useState<Algorithm | null>(null);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setSeen(0);
    setTimeLeft(60);
    setIsActive(true);
    setIsFinished(false);
    nextAlg();
  };

  const nextAlg = () => {
    const randomIndex = Math.floor(Math.random() * ALGORITHMS.length);
    setCurrentAlg(ALGORITHMS[randomIndex]);
    setSeen(s => s + 1);
    setKey(k => k + 1);
  };

  const handleResult = (correct: boolean) => {
    if (!isActive) return;
    if (correct) setScore(s => s + 1);
    nextAlg();
  };

  if (!currentAlg && !isFinished && !isActive) {
    // Start screen
    return (
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12 text-center relative">
        <button onClick={onExit} className="absolute -left-12 top-0 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors flex items-center gap-2 border border-white/10">
          ← Back
        </button>
        <Award className="w-32 h-32 text-yellow-500 mb-8 drop-shadow-[0_0_25px_rgba(234,179,8,0.4)]" />
        <h2 className="text-5xl font-black text-white mb-4">60-Second Blitz</h2>
        <p className="text-slate-400 mb-10 max-w-md text-lg">Mentally identify and recall as many algorithms as possible within 60 seconds.</p>
        <button onClick={startGame} className="px-12 py-5 rounded-2xl font-black text-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
          <Play fill="currentColor" className="w-8 h-8" /> Start Challenge
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12 text-center relative">
        <button onClick={onExit} className="absolute -left-12 top-0 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors flex items-center gap-2 border border-white/10">
          ← Exit
        </button>
        <h2 className="text-5xl font-black text-white mb-2">Time's Up!</h2>
        <p className="text-slate-400 mb-8 text-lg">You evaluated {seen - 1} cases.</p>
        
        <div className="bg-black/20 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl mb-10 flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
          <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 drop-shadow-2xl relative z-10">{score}</span>
          <span className="text-xl font-bold text-slate-300 uppercase tracking-[0.3em] mt-6 relative z-10">Correct Guesses</span>
        </div>

        <button onClick={startGame} className="px-10 py-4 rounded-xl font-bold text-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2">
          <RotateCcw className="w-6 h-6" /> Play Again
        </button>
      </div>
    );
  }

  const setupMoves = currentAlg ? getInverseAlgorithm(currentAlg.algorithm) : "";

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full py-6 relative">
      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={() => { setIsActive(false); onExit(); }} className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors border border-red-500/20">
          Quit Challenge
        </button>
        <div className="flex items-center gap-6">
          <span className="text-2xl font-black text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10">Score: <span className="text-yellow-400">{score}</span></span>
          <div className={`px-6 py-2 rounded-xl font-mono text-2xl font-bold border ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-slate-800/80 text-slate-200 border-slate-700 shadow-xl'}`}>
            0:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full">
        <div className="bg-black/50 rounded-2xl p-2 relative min-h-[400px] mb-8 flex justify-center items-center overflow-hidden">
             <CubePlayer key={key} scramble={setupMoves} solution="" puzzle="3x3x3" autoPlay={false} controlPanel="none" visualization="3D" background="none" />
        </div>
        
        <div className="flex justify-center mb-8">
          <p className="text-slate-300 text-xl font-medium">Was it: <strong className="text-yellow-400 tracking-wider font-bold mx-2 text-2xl bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">{currentAlg?.name}</strong>?</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button onClick={() => handleResult(false)} className="py-5 rounded-2xl font-bold text-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <X className="w-6 h-6" /> I Didn't Know
          </button>
          <button onClick={() => handleResult(true)} className="py-5 rounded-2xl font-bold text-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <Check className="w-6 h-6" /> I Knew It
          </button>
        </div>
      </div>
    </div>
  );
}
