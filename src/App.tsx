import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PracticePage from "./pages/Practice";
import Header from "./components/Header";
import LearnPage from "./pages/LearnPage";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/practice" element={<PageWrapper><PracticePage /></PageWrapper>} />
        <Route path="/learn" element={<PageWrapper><LearnPage /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="w-full flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" toastOptions={{ className: 'border border-white/10 bg-black/50 backdrop-blur-xl text-white' }} />
      <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col relative overflow-x-hidden">
        {/* Unified Global Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full" />
          <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[140px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
        </div>
        
        <BrowserRouter>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <AnimatedRoutes />
          </div>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
