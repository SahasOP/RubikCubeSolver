import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import { Github, BookOpen, Sparkles, Zap, Target, LogIn, UserCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";
export default function Header() {
  const { user } = useAuth();
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
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Algorithm Finder</h1>
              <p className="text-xs text-cyan-300/70 font-medium tracking-wide flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Double BFS • Optimal Solutions • cubing.js
              </p>
            </div>
          </motion.div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/practice"
                className="px-4 py-2 text-sm font-medium text-slate-200 
          bg-slate-800/60 hover:bg-slate-700/70
          border border-slate-700 rounded-xl
          flex items-center gap-2 transition-all"
              >
                <Target className="w-4 h-4" />
                Practice
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/learn"
                className="px-4 py-2 text-sm font-medium text-slate-200 
          bg-slate-800/60 hover:bg-slate-700/70
          border border-slate-700 rounded-xl
          flex items-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                Learn
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-slate-200 
          bg-slate-800/60 hover:bg-slate-700/70
          border border-slate-700 rounded-xl
          flex items-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                Home
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
                  className="w-10 h-10 rounded-full 
        bg-slate-800 border border-slate-700
        flex items-center justify-center
        hover:bg-slate-700 transition-all"
                >
                  <UserCircle className="w-6 h-6 text-cyan-400" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
