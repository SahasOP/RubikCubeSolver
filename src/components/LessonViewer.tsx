// src/components/LessonViewer.tsx
// Interactive lesson viewer with progress tracking

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock, BookOpen, Lightbulb, Target } from "lucide-react";
import { Lesson, LessonContent } from "../types/learning";
import { AlgorithmCard } from "./AlgorithmCard";

interface LessonViewerProps {
  lesson: Lesson;
  onComplete?: (lessonId: string) => void;
  isCompleted?: boolean;
}

export const LessonViewer = ({ lesson, onComplete, isCompleted = false }: LessonViewerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = lesson.content.length + lesson.algorithms.length;
  const isLastStep = currentStep >= totalSteps - 1;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete lesson
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      onComplete?.(lesson.id);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const getCurrentContent = (): LessonContent | null => {
    if (currentStep < lesson.content.length) {
      return lesson.content[currentStep];
    }
    return null;
  };

  const getCurrentAlgorithm = () => {
    const algIndex = currentStep - lesson.content.length;
    if (algIndex >= 0 && algIndex < lesson.algorithms.length) {
      return lesson.algorithms[algIndex];
    }
    return null;
  };

  const content = getCurrentContent();
  const algorithm = getCurrentAlgorithm();

  const progress = ((completedSteps.size / totalSteps) * 100).toFixed(0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Lesson Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">{lesson.title}</h1>
            <p className="text-lg text-white/70">{lesson.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-white/60">Duration</div>
              <div className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {lesson.duration}
              </div>
            </div>

            {isCompleted && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-400/20 border border-green-400/30 rounded-xl px-4 py-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="text-right mt-2 text-sm text-white/60">
          Progress: {progress}% ({completedSteps.size}/{totalSteps} steps)
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Step Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Steps
            </h3>

            <div className="space-y-2">
              {/* Content Steps */}
              {lesson.content.map((item, index) => (
                <button key={`content-${index}`} onClick={() => goToStep(index)} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${currentStep === index ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-300" : completedSteps.has(index) ? "bg-green-400/10 border border-green-400/20 text-green-300" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}>
                  {completedSteps.has(index) ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm font-medium truncate">{item.title || `Step ${index + 1}`}</span>
                </button>
              ))}

              {/* Algorithm Steps */}
              {lesson.algorithms.map((alg, index) => {
                const stepIndex = lesson.content.length + index;
                return (
                  <button key={`alg-${index}`} onClick={() => goToStep(stepIndex)} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${currentStep === stepIndex ? "bg-purple-400/20 border border-purple-400/30 text-purple-300" : completedSteps.has(stepIndex) ? "bg-green-400/10 border border-green-400/20 text-green-300" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}>
                    {completedSteps.has(stepIndex) ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <Circle className="w-4 h-4 flex-shrink-0" />}
                    <span className="text-sm font-medium truncate">{alg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {content && (
              <motion.div key={`content-${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                {/* Content Header */}
                {content.title && (
                  <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                    {content.title}
                  </h2>
                )}

                {/* Content Body */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-white/80 leading-relaxed mb-6">{content.content}</p>

                  {/* Notes */}
                  {content.notes && content.notes.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Key Points
                      </h4>
                      <ul className="space-y-2">
                        {content.notes.map((note, index) => (
                          <li key={index} className="text-white/70 flex items-start gap-3">
                            <span className="text-cyan-400 mt-1">✓</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interactive Algorithm Demo */}
                  {content.algorithm && (
                    <div className="mt-6">
                      <h4 className="text-xl font-bold text-white mb-4">Try This Move:</h4>
                      <AlgorithmCard
                        algorithm={{
                          id: `demo-${currentStep}`,
                          name: content.title || "Demo",
                          algorithm: content.algorithm,
                          category: "basic-moves",
                          difficulty: "beginner",
                          description: "Practice this fundamental move",
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {algorithm && (
              <motion.div key={`algorithm-${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <AlgorithmCard algorithm={algorithm} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <motion.button whileHover={{ scale: 1.05, x: -4 }} whileTap={{ scale: 0.95 }} onClick={handlePrevious} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-5 h-5" />
              Previous
            </motion.button>

            <div className="text-sm text-white/60">
              Step {currentStep + 1} of {totalSteps}
            </div>

            <motion.button whileHover={{ scale: 1.05, x: 4 }} whileTap={{ scale: 0.95 }} onClick={handleNext} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isLastStep ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-green-500/50" : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50"}`}>
              {isLastStep ? "Complete Lesson" : "Next"}
              {!isLastStep && <ChevronRight className="w-5 h-5" />}
              {isLastStep && <CheckCircle className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
