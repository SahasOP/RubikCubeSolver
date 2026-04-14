// src/pages/PracticePage.tsx
// Enhanced Speedcubing Practice Timer with 3D Cube Visualization

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Download, Trash2, Eye, EyeOff, Trophy, TrendingUp, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/* ---------------- CUBING.JS INTEGRATION ---------------- */

// Dynamically load cubing.js twisty player
const CubeVisualization = ({ scramble, isVisible }: { scramble: string; isVisible: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    // Clear previous cube
    containerRef.current.innerHTML = "";

    // Create twisty player
    const player = document.createElement("twisty-player");
    player.setAttribute("puzzle", "3x3x3");
    player.setAttribute("alg", scramble);
    player.setAttribute("background", "none");
    player.setAttribute("control-panel", "none");
    player.setAttribute("visualization", "3D");
    player.setAttribute("hint-facelets", "none");
    player.style.width = "100%";
    player.style.height = "300px";

    containerRef.current.appendChild(player);
  }, [scramble, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="cube-container">
      <div ref={containerRef} className="w-full" />
    </motion.div>
  );
};

/* ---------------- SCRAMBLE GENERATOR ---------------- */

const MOVES = ["R", "L", "U", "D", "F", "B"];
const SUFFIX = ["", "'", "2"];

function generateScramble(len = 20) {
  let res: string[] = [];
  let prev = "";

  while (res.length < len) {
    const m = MOVES[Math.floor(Math.random() * 6)];
    if (m === prev) continue;
    prev = m;
    res.push(m + SUFFIX[Math.floor(Math.random() * 3)]);
  }
  return res.join(" ");
}

/* ---------------- TYPES ---------------- */

type Solve = {
  time: number;
  scramble: string;
  createdAt: number;
  dnf?: boolean;
  plusTwo?: boolean;
};

/* ---------------- MAIN COMPONENT ---------------- */

export default function PracticePage() {
  const [scramble, setScramble] = useState(generateScramble());
  const [time, setTime] = useState("0.00");
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [showCube, setShowCube] = useState(true);
  const [scrambleLength, setScrambleLength] = useState(20);
  const [inspectionTime, setInspectionTime] = useState(false);
  const [inspection, setInspection] = useState(15);
  const [showStats, setShowStats] = useState(true);
  const [pendingSolve, setPendingSolve] = useState<Solve | null>(null);

  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const startTime = useRef(0);
  const raf = useRef<number | null>(null);
  const inspectionInterval = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProfileData();
  }, []);
  const fetchProfileData = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user as any);

    // Fetch profile
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();

    // Fetch solves
    const { data: dbSolves } = await supabase.from("solves").select("time, scramble, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);

    if (dbSolves?.length) {
      setSolves(
        dbSolves.map((s) => ({
          time: s.time,
          scramble: s.scramble,
          createdAt: new Date(s.created_at).getTime(),
        }))
      );
    }

    setUser((prev: any) => ({ ...prev, name: profile?.name }));
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  /* ---------------- TIMER FUNCTIONS ---------------- */

  const startInspection = () => {
    setInspection(15);
    inspectionInterval.current = setInterval(() => {
      setInspection((prev) => {
        if (prev <= 1) {
          clearInterval(inspectionInterval.current!);
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTimer = () => {
    if (inspectionInterval.current) {
      clearInterval(inspectionInterval.current);
    }
    startTime.current = performance.now();
    setRunning(true);

    const update = (now: number) => {
      const t = ((now - startTime.current) / 1000).toFixed(2);
      setTime(t);
      raf.current = requestAnimationFrame(update);
    };

    raf.current = requestAnimationFrame(update);
  };

  const stopTimer = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (inspectionInterval.current) clearInterval(inspectionInterval.current);

    setRunning(false);

    const finalTime = parseFloat(time);

    setPendingSolve({
      time: finalTime,
      scramble,
      createdAt: Date.now(),
    });

    setScramble(generateScramble(scrambleLength));
    setTime("0.00");
  }, [time, scramble, scrambleLength]);

  const saveSolve = useCallback(async (finalTime: number, scramble: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("solves").insert({
      user_id: user.id,
      time: finalTime,
      scramble,
    });
  }, []);

  const loadRecentSolves = async () => {  
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase.from("solves").select("time, scramble, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);

    setHistory(data || []);
  };

  const deleteLastSolve = () => {
    setSolves((prev) => prev.slice(1));
  };

  const clearAllSolves = () => {
    if (confirm("Clear all solves?")) {
      setSolves([]);
    }
  };

  const toggleDNF = (index: number) => {
    setSolves((prev) => prev.map((s, i) => (i === index ? { ...s, dnf: !s.dnf } : s)));
  };

  const togglePlusTwo = (index: number) => {
    setSolves((prev) => prev.map((s, i) => (i === index ? { ...s, plusTwo: !s.plusTwo } : s)));
  };
  const runningRef = useRef(running);
  const readyRef = useRef(ready);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  /* ---------------- KEYBOARD CONTROLS ---------------- */

  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();

      // Hold space to get ready
      if (!runningRef.current && !readyRef.current) {
        setReady(true);
      }

      // Stop timer if running
      else if (runningRef.current) {
        stopTimer();
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();

      // Release space → start timer
      if (readyRef.current && !runningRef.current) {
        setReady(false);
        startTimer();
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [startTimer, stopTimer]);
  useEffect(() => {
    if (!pendingSolve) return;

    const persist = async () => {
      await saveSolve(pendingSolve.time, pendingSolve.scramble);
      loadRecentSolves();
    };

    persist();
  }, [pendingSolve, saveSolve]);

  /* ---------------- STATISTICS ---------------- */

  const validSolves = solves.filter((s) => !s.dnf);
  const adjustedTimes = validSolves.map((s) => s.time + (s.plusTwo ? 2 : 0));

  const best = adjustedTimes.length > 0 ? Math.min(...adjustedTimes).toFixed(2) : "-";
  const worst = adjustedTimes.length > 0 ? Math.max(...adjustedTimes).toFixed(2) : "-";
  const avg = adjustedTimes.length > 0 ? (adjustedTimes.reduce((a, b) => a + b, 0) / adjustedTimes.length).toFixed(2) : "-";

  const calculateAo = (n: number) => {
    if (validSolves.length < n) return "-";
    const times = adjustedTimes.slice(0, n).sort((a, b) => a - b);
    const trimmed = times.slice(1, -1);
    return (trimmed.reduce((a, b) => a + b, 0) / trimmed.length).toFixed(2);
  };

  const ao5 = calculateAo(5);
  const ao12 = calculateAo(12);
  const ao100 = calculateAo(100);

  /* ---------------- EXPORT DATA ---------------- */

  const exportSolves = () => {
    const data = JSON.stringify(solves, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solves-${Date.now()}.json`;
    a.click();
  };

  /* ---------------- UI RENDER ---------------- */

  if (loading)
    return (
      <div className="flex-grow flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full" />
      </div>
    );

  return (
    <div className="relative w-full">

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        {/* <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">⚡ SpeedCube Timer</h1>
          <p className="text-cyan-300/70 text-sm">Professional practice mode with 3D visualization</p>
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls & Settings */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            {/* Settings Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Settings
              </h3>
              
              {!user && (
                 <div className="mb-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-xs font-semibold">
                   Guest Mode: Solves are saved locally for this session. Log in to track performance.
                 </div>
              )}

              <div className="space-y-4">
                {/* Scramble Length */}
                <div>
                  <label className="text-sm text-cyan-300/80 block mb-2">Scramble Length: {scrambleLength}</label>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    value={scrambleLength}
                    onChange={(e) => {
                      setScrambleLength(Number(e.target.value));
                      setScramble(generateScramble(Number(e.target.value)));
                    }}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Inspection Toggle
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-cyan-300/80">15s Inspection</span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${inspectionTime ? "bg-cyan-500" : "bg-white/10"}`} onClick={() => setInspectionTime(!inspectionTime)}>
                    <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" animate={{ x: inspectionTime ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </div>
                </label> */}

                {/* Show Cube Toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-cyan-300/80">Show 3D Cube</span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${showCube ? "bg-purple-500" : "bg-white/10"}`} onClick={() => setShowCube(!showCube)}>
                    <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" animate={{ x: showCube ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </div>
                </label>

                {/* Show Stats Toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-cyan-300/80">Show Statistics</span>
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${showStats ? "bg-blue-500" : "bg-white/10"}`} onClick={() => setShowStats(!showStats)}>
                    <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" animate={{ x: showStats ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setScramble(generateScramble(scrambleLength))} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  <RotateCcw className="w-4 h-4" />
                  New Scramble
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportSolves} disabled={solves.length === 0} className="w-full py-3 bg-white/5 text-white rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 disabled:opacity-30">
                  <Download className="w-4 h-4" />
                  Export Data
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clearAllSolves} disabled={solves.length === 0} className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2 border border-red-500/20 disabled:opacity-30 hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Statistics Card */}
            <AnimatePresence>
              {showStats && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Statistics
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Best" value={best} color="from-green-400 to-emerald-500" />
                    <StatBox label="Worst" value={worst} color="from-red-400 to-rose-500" />
                    <StatBox label="Average" value={avg} color="from-blue-400 to-cyan-500" />
                    <StatBox label="Count" value={solves.length.toString()} color="from-purple-400 to-pink-500" />
                    <StatBox label="Ao5" value={ao5} color="from-yellow-400 to-orange-500" />
                    <StatBox label="Ao12" value={ao12} color="from-indigo-400 to-violet-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Center Panel - Timer & Scramble */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-6">
            {/* Scramble Display */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider">Scramble</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowCube(!showCube)} className="text-cyan-400 hover:text-cyan-300">
                  {showCube ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>

              <motion.div key={scramble} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-white text-center mb-6 tracking-wider leading-relaxed">
                {scramble}
              </motion.div>

              {/* 3D Cube Visualization */}
              <AnimatePresence>
                <CubeVisualization scramble={scramble} isVisible={showCube} />
              </AnimatePresence>
            </div>

            {/* Timer Display */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />

              {/* Inspection countdown */}
              <AnimatePresence>
                {inspectionTime && inspection < 15 && inspection > 0 && !running && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl px-4 py-2">
                    <span className="text-yellow-300 font-bold">Inspection: {inspection}s</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="text-center relative z-10"
                animate={{
                  scale: ready ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-9xl font-black mb-4"
                  style={{
                    color: ready ? "#22d3ee" : running ? "#a78bfa" : "#e5e7eb",
                    textShadow: ready ? "0 0 40px rgba(74, 222, 128, 0.5)" : running ? "0 0 40px rgba(96, 165, 250, 0.5)" : "none",
                  }}
                >
                  {time}
                </motion.div>

                <div className="text-sm text-white/60 font-medium">
                  {ready ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400">
                      ✓ Ready - Release SPACE to start
                    </motion.span>
                  ) : running ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400">
                      ⏱ Solving... Press SPACE to stop
                    </motion.span>
                  ) : (
                    <span>Hold SPACE to prepare</span>
                  )}
                </div>
              </motion.div>
            </div>
            <AnimatePresence>
              {pendingSolve && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex justify-center gap-4 mt-4">
                  {[
                    { label: "OK", action: "OK" },
                    { label: "+2", action: "+2" },
                    { label: "DNF", action: "DNF" },
                  ].map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => {
                        let solve = { ...pendingSolve };

                        if (btn.action === "+2") solve.plusTwo = true;
                        if (btn.action === "DNF") solve.dnf = true;

                        setSolves((prev) => [solve, ...prev]);
                        setPendingSolve(null);
                      }}
                      className={`px-6 py-2 rounded-xl border backdrop-blur font-semibold
            ${btn.action === "OK" ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300" : btn.action === "+2" ? "bg-yellow-500/10 border-yellow-400/30 text-yellow-300" : "bg-red-500/10 border-red-400/30 text-red-300"}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solve History */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Recent Solves
                </h3>
                {solves.length > 0 && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={deleteLastSolve} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    Delete Last
                  </motion.button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {solves.slice(0, 20).map((solve, index) => (
                    <motion.div key={solve.createdAt} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.05 }} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-white">{solve.dnf ? <span className="text-red-400">DNF</span> : (solve.time + (solve.plusTwo ? 2 : 0)).toFixed(2)}</span>
                          {solve.plusTwo && !solve.dnf && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">+2</span>}
                          {parseFloat(best) > 0 && !solve.dnf && (solve.time + (solve.plusTwo ? 2 : 0)).toFixed(2) === best && <Trophy className="w-4 h-4 text-yellow-400" />}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => togglePlusTwo(index)} className={`text-xs px-2 py-1 rounded ${solve.plusTwo ? "bg-yellow-400/20 text-yellow-300" : "bg-white/5 text-white/50"}`}>
                            +2
                          </button>
                          <button onClick={() => toggleDNF(index)} className={`text-xs px-2 py-1 rounded ${solve.dnf ? "bg-red-400/20 text-red-300" : "bg-white/5 text-white/50"}`}>
                            DNF
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-white/40 flex items-center justify-between">
                        <span className="font-mono">{solve.scramble.substring(0, 40)}...</span>
                        <span>{new Date(solve.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {solves.length === 0 && (
                  <div className="text-center py-12 text-white/40">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No solves yet. Press SPACE to start!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  );
}

/* ---------------- STAT BOX COMPONENT ---------------- */

const StatBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <motion.div whileHover={{ scale: 1.05, y: -2 }} className="bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
    <div className="relative z-10">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</p>
    </div>
  </motion.div>
);
