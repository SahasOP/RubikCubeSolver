// src/pages/LearnPage.tsx
// Main learning platform with lessons, algorithms, and practice modes

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code, Dumbbell, Search, Filter, TrendingUp, Trophy, Target, Sparkles, GraduationCap } from "lucide-react";
import { AlgorithmCard } from "../components/AlgorithmCard";
import { LessonViewer } from "../components/LessonViewer";
import { ALGORITHMS, LESSONS } from "../data/algorithms";
import { Algorithm, Lesson, DifficultyLevel, AlgorithmCategory } from "../types/learning";

type Tab = "lessons" | "algorithms" | "practice";

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<AlgorithmCategory | "all">("all");
  const [masteredAlgs, setMasteredAlgs] = useState<Set<string>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Filter algorithms
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS.filter((alg) => {
      const matchesSearch = alg.name.toLowerCase().includes(searchQuery.toLowerCase()) || alg.description.toLowerCase().includes(searchQuery.toLowerCase()) || alg.algorithm.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = selectedDifficulty === "all" || alg.difficulty === selectedDifficulty;

      const matchesCategory = selectedCategory === "all" || alg.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [searchQuery, selectedDifficulty, selectedCategory]);

  const handleMasterAlgorithm = (id: string) => {
    setMasteredAlgs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCompleteLesson = (id: string) => {
    setCompletedLessons((prev) => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 via-indigo-500/10 to-violet-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
            <GraduationCap className="w-16 h-16 text-cyan-400" />
            Cube Academy
          </h1>
          <p className="text-xl text-cyan-300/70">Master speedcubing from beginner to expert</p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl px-6 py-3 border border-white/10">
              <div className="text-2xl font-bold text-cyan-400">{completedLessons.size}</div>
              <div className="text-xs text-white/60">Lessons Completed</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl px-6 py-3 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">{masteredAlgs.size}</div>
              <div className="text-xs text-white/60">Algorithms Mastered</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl px-6 py-3 border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">{Math.round((masteredAlgs.size / ALGORITHMS.length) * 100)}%</div>
              <div className="text-xs text-white/60">Overall Progress</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 border border-white/10 inline-flex gap-2">
            <TabButton
              active={activeTab === "lessons"}
              onClick={() => {
                setActiveTab("lessons");
                setSelectedLesson(null);
              }}
              icon={<BookOpen className="w-5 h-5" />}
              label="Lessons"
            />
            <TabButton active={activeTab === "algorithms"} onClick={() => setActiveTab("algorithms")} icon={<Code className="w-5 h-5" />} label="Algorithms" />
            <TabButton active={activeTab === "practice"} onClick={() => setActiveTab("practice")} icon={<Dumbbell className="w-5 h-5" />} label="Practice" />
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "lessons" && !selectedLesson && (
            <motion.div key="lessons-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LESSONS.map((lesson, index) => (
                <LessonCard key={lesson.id} lesson={lesson} onClick={() => setSelectedLesson(lesson)} isCompleted={completedLessons.has(lesson.id)} delay={index * 0.1} />
              ))}
            </motion.div>
          )}

          {activeTab === "lessons" && selectedLesson && (
            <motion.div key="lesson-viewer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <button onClick={() => setSelectedLesson(null)} className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Back to Lessons
              </button>
              <LessonViewer lesson={selectedLesson} onComplete={handleCompleteLesson} isCompleted={completedLessons.has(selectedLesson.id)} />
            </motion.div>
          )}

          {activeTab === "algorithms" && (
            <motion.div key="algorithms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Filters */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input type="text" placeholder="Search algorithms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
                </div>

                {/* Difficulty Filter */}
                <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value as any)} className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                {/* Category Filter */}
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as any)} className="px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
                  <option value="all">All Categories</option>
                  <option value="basic-moves">Basic Moves</option>
                  <option value="cross">Cross</option>
                  <option value="f2l">F2L</option>
                  <option value="oll">OLL</option>
                  <option value="pll">PLL</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-white/60">
                Showing {filteredAlgorithms.length} of {ALGORITHMS.length} algorithms
              </div>

              {/* Algorithms Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAlgorithms.map((alg, index) => (
                  <motion.div key={alg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <AlgorithmCard algorithm={alg} onMaster={handleMasterAlgorithm} isMastered={masteredAlgs.has(alg.id)} />
                  </motion.div>
                ))}
              </div>

              {filteredAlgorithms.length === 0 && (
                <div className="text-center py-20 text-white/40">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No algorithms found matching your criteria</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "practice" && (
            <motion.div key="practice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-20">
              <Dumbbell className="w-24 h-24 mx-auto mb-6 text-purple-400 opacity-50" />
              <h2 className="text-3xl font-bold text-white mb-4">Practice Mode</h2>
              <p className="text-white/60 mb-8 max-w-2xl mx-auto">Test your knowledge with random algorithms and timed challenges. Coming soon!</p>
              <div className="flex justify-center gap-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-shadow">
                  Random Algorithm Drill
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-shadow">
                  Timed Challenge
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ SUB-COMPONENTS ============ */

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${active ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"}`}>
    {icon}
    {label}
  </motion.button>
);

const LessonCard = ({ lesson, onClick, isCompleted, delay }: { lesson: Lesson; onClick: () => void; isCompleted: boolean; delay: number }) => {
  const difficultyColors = {
    beginner: "from-green-400 to-emerald-500",
    intermediate: "from-yellow-400 to-orange-500",
    advanced: "from-orange-400 to-red-500",
    expert: "from-red-400 to-rose-500",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} whileHover={{ y: -8, scale: 1.02 }} onClick={onClick} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer group relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
            <p className="text-sm text-white/60">{lesson.description}</p>
          </div>
          {isCompleted && (
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="bg-green-400/20 border border-green-400/30 rounded-full p-2">
              <Trophy className="w-5 h-5 text-green-400" />
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${difficultyColors[lesson.difficulty]} text-white`}>{lesson.difficulty}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/80">{lesson.duration}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">{lesson.algorithms.length} algorithms</span>
        </div>

        <motion.div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-4 transition-all">
          Start Learning
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
};
