import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Github, BookOpen, Sparkles, Zap, Target, LogIn, UserCircle, Home, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  return (
    <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="border-b border-slate-700/50 bg-black/20 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.02 }}>
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500
 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] relative overflow-hidden group"
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-300 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
              <span className="text-2xl relative z-10">🧩</span>
            </motion.div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Cube Mind</h1>
              {/* <p className="text-xs text-cyan-300/70 font-medium tracking-wide flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Double BFS • Optimal Solutions • cubing.js
              </p> */}
            </div>
          </motion.div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium border rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  isActive("/") ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "text-slate-300 bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50"
                }`}
              >
                <Home className={`w-4 h-4 ${isActive("/") ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : ""}`} />
                Solver
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/practice"
                className={`px-4 py-2 text-sm font-medium border rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  isActive("/practice") ? "bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "text-slate-300 bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50"
                }`}
              >
                <Target className={`w-4 h-4 ${isActive("/practice") ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : ""}`} />
                Practice
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/learn"
                className={`px-4 py-2 text-sm font-medium border rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  isActive("/learn") ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "text-slate-300 bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isActive("/learn") ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : ""}`} />
                Learn
              </Link>
            </motion.div>
          </div>
          <div className="flex gap-2 items-center">
            {!user ? (
              <>
                {/* Login */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-200 
          bg-slate-800/60 hover:bg-slate-700/70
          border border-slate-700 rounded-xl
          flex items-center gap-2 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </motion.div>

                {/* Sign up */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-semibold text-slate-100
          bg-indigo-600 hover:bg-indigo-500
          rounded-xl shadow-lg shadow-indigo-600/30
          transition-all"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            ) : (
              /* Profile Icon */
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/profile"
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    isActive("/profile") ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${isActive("/profile") ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "text-cyan-400"}`} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
