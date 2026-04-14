import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, TrendingUp, Trophy, Timer, Hash, Calendar, ChevronRight, Activity, Zap } from "lucide-react";
import { Box, Tooltip, Typography, Stack, styled, tooltipClasses, TooltipProps } from "@mui/material";
import { format, subDays, eachDayOfInterval, isSameDay, startOfWeek } from "date-fns";

/* ---------------- Styled Components ---------------- */

// Custom Styled Tooltip to match LeetCode/GitHub aesthetic
const ActivityTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#0f172a", // slate-900
    color: "#f8fafc",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "8px 12px",
    fontSize: "11px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#0f172a",
    "&::before": {
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
}));

const Square = styled(Box, {
  shouldForwardProp: (prop) => prop !== "level",
})<{ level: number }>(({ level }) => {
  const colors = [
    "rgba(30, 41, 59, 0.4)", // Level 0: Slate-800
    "rgba(8, 79, 102, 0.4)", // Level 1: Cyan-900
    "rgba(14, 116, 144, 0.6)", // Level 2: Cyan-700
    "rgba(6, 182, 212, 0.8)", // Level 3: Cyan-500
    "#22d3ee", // Level 4: Cyan-400
  ];

  return {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors[level],
    transition: "all 0.2s ease",
    cursor: "crosshair",
    boxShadow: level === 4 ? "0 0 10px rgba(34, 211, 238, 0.4)" : "none",
    "&:hover": {
      transform: "scale(1.2)",
      zIndex: 1,
      border: "1px solid rgba(255,255,255,0.2)",
    },
  };
});

/* ---------------- Main Component ---------------- */

export const MUIActivityHub = ({ solves }: { solves: any[] }) => {
  // 1. Data Processing
  const { weeks, monthLabels } = useMemo(() => {
    const end = new Date();
    const start = startOfWeek(subDays(end, 154)); // 22 weeks
    const allDays = eachDayOfInterval({ start, end }).map((date) => {
      const count = solves.filter((s) => isSameDay(new Date(s.created_at), date)).length;
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
      return { date, count, level };
    });

    const weekArr = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weekArr.push(allDays.slice(i, i + 7));
    }

    const labels: { label: string; offset: number }[] = [];
    weekArr.forEach((week, i) => {
      const month = format(week[0].date, "MMM");
      if (labels.length === 0 || labels[labels.length - 1].label !== month) {
        labels.push({ label: month, offset: i });
      }
    });

    return { weeks: weekArr, monthLabels: labels };
  }, [solves]);

  return (
    <Box sx={{ width: "100%", overflow: "hidden", p: 1 }}>
      {/* Month Header */}
      <Box sx={{ position: "relative", height: 20, mb: 1 }}>
        {monthLabels.map((m, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              position: "absolute",
              left: m.offset * 20, // 14px square + 6px gap
              fontSize: "9px",
              fontWeight: 900,
              color: "000",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {m.label}
          </Typography>
        ))}
      </Box>

      {/* Grid Body */}
      <Stack direction="row" spacing={0.75} sx={{ overflowX: "auto", pb: 2 }}>
        {/* Day Labels */}
        <Stack spacing={0.75} sx={{ pt: 0.5, pr: 1 }}>
          {["Mon", "", "Wed", "", "Fri", "", ""].map((day, i) => (
            <Typography key={i} sx={{ fontSize: "8px", fontWeight: 900, height: 14, color: "000", textTransform: "uppercase" }}>
              {day}
            </Typography>
          ))}
        </Stack>

        {/* Heatmap Grid */}
        {weeks.map((week, weekIdx) => (
          <Stack key={weekIdx} spacing={0.75}>
            {week.map((day, dayIdx) => (
              <ActivityTooltip
                key={dayIdx}
                arrow
                placement="top"
                title={
                  <Box>
                    <Typography variant="inherit" sx={{ fontWeight: 900, display: "block" }}>
                      {day.count} {day.count === 1 ? "Solve" : "Solves"}
                    </Typography>
                    <Typography variant="inherit" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "9px" }}>
                      {format(day.date, "EEEE, MMM do, yyyy")}
                    </Typography>
                  </Box>
                }
              >
                <Square level={day.level} />
              </ActivityTooltip>
            ))}
          </Stack>
        ))}
      </Stack>

      {/* Legend Footer */}
      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "text.secondary" }}>LESS</Typography>
        {[0, 1, 2, 3, 4].map((l) => (
          <Square key={l} level={l} sx={{ width: 10, height: 10, cursor: "default", "&:hover": { transform: "none" } }} />
        ))}
        <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "text.secondary" }}>MORE</Typography>
      </Stack>
    </Box>
  );
};

/* ---------------- Spatial UI Card ---------------- */
const SpatialCard = ({ children, title, icon: Icon, className = "" }) => (
  <motion.div whileHover={{ y: -4 }} className={`bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative group overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    {title && (
      <div className="flex items-center gap-2 mb-6 text-slate-400">
        <Icon size={16} className="text-cyan-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{title}</span>
      </div>
    )}
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [allSolves, setAllSolves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    const { data: solves } = await supabase.from("solves").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

    if (solves?.length) {
      setAllSolves(solves);
      calculateStats(solves);
      setHistory(solves.slice(0, 8));
    }
    setUser((prev) => ({ ...prev, name: profile?.name }));
    setLoading(false);
  };

  const calculateStats = (solves) => {
    const times = solves.map((s) => s.time);
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const best = Math.min(...times).toFixed(2);
    const ao5 = times.length >= 5 ? (times.slice(0, 5).reduce((a, b) => a + b, 0) / 5).toFixed(2) : "-";

    setStats({ total: times.length, best, avg, ao5 });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading)
    return (
      <div className="flex-grow flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full" />
      </div>
    );

  return (
    <div className="relative w-full p-8 font-sans">
      <main className="max-w-7xl mx-auto relative z-10">
        {/* Header Header */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              DASHBOARD<span className="text-cyan-500">.</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
              <Activity size={14} /> System Online • Personal Performance Analytics
            </p>
          </div>
          <button onClick={logout} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* User & Identity Card */}
          <SpatialCard className="col-span-12 lg:col-span-4 flex flex-col justify-between h-[300px]">
            <div className="flex items-start justify-between">
              <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                <div className="w-full h-full bg-[#020617] rounded-[1.4rem] flex items-center justify-center text-3xl font-black">{user?.name?.[0] || "C"}</div>
              </div>
              <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 tracking-widest uppercase">Active Member</div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{user?.name || "Cubing User"}</h2>
              <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
            </div>
          </SpatialCard>

          {/* Activity Heatmap Card */}
          <SpatialCard title="Training Density" icon={Calendar} className="col-span-12 lg:col-span-8 flex flex-col justify-between">
            <div className="mt-4">
              <MUIActivityHub solves={allSolves} />
            </div>
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Zap size={12} /> Streak: <span className="text-white">12 Days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Hash size={12} /> Rank: <span className="text-white">#420</span>
                </div>
              </div>
              <button className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:gap-2 transition-all">
                View All Activity <ChevronRight size={14} />
              </button>
            </div>
          </SpatialCard>

          {/* Performance Stats */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard label="Solves" value={stats?.total || 0} icon={Hash} color="text-slate-400" />
            <MetricCard label="Best Time" value={`${stats?.best || "0.00"}s`} icon={Trophy} color="text-yellow-400" />
            <MetricCard label="Average" value={`${stats?.avg || "0.00"}s`} icon={TrendingUp} color="text-cyan-400" />
            <MetricCard label="Ao5" value={`${stats?.ao5 || "0.00"}s`} icon={Timer} color="text-purple-400" />
          </div>

          {/* History List */}
          <SpatialCard title="Terminal Logs" icon={Activity} className="col-span-12">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-4 text-left font-black">Reference</th>
                    <th className="pb-4 text-left font-black">Magnitude</th>
                    <th className="pb-4 text-left font-black">Sequence Pattern</th>
                    <th className="pb-4 text-right font-black">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors">
                      <td className="py-4 text-xs font-mono text-slate-500">REF-{1000 + i}</td>
                      <td className="py-4 text-sm font-black text-cyan-400">{s.time}s</td>
                      <td className="py-4 text-xs font-mono text-slate-400 truncate max-w-[400px]">{s.scramble}</td>
                      <td className="py-4 text-[10px] text-slate-500 text-right font-bold uppercase">{new Date(s.created_at).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpatialCard>
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }) => (
  <SpatialCard className="flex flex-col items-center justify-center py-10">
    <Icon className={`mb-4 ${color}`} size={24} />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
    <p className="text-3xl font-black text-white">{value}</p>
  </SpatialCard>
);

export default Profile;
