import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex-grow w-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl 
        border border-slate-700 rounded-3xl p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Create account</h1>
        <p className="text-sm text-slate-400 mb-6">Join to store solutions and analyze performance</p>

        {/* Email */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">Email</label>
          <div className="flex items-center bg-slate-800 rounded-xl px-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <input type="email" className="bg-transparent w-full px-3 py-3 text-slate-100 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-1 block">Password</label>
          <div className="flex items-center bg-slate-800 rounded-xl px-3">
            <Lock className="w-4 h-4 text-slate-400" />
            <input type="password" className="bg-transparent w-full px-3 py-3 text-slate-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          onClick={handleSignup}
          className="w-full py-3 rounded-xl font-semibold text-white
          bg-indigo-600 hover:bg-indigo-500 transition-all
          shadow-lg shadow-indigo-600/30"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </motion.button>

        <p className="text-sm text-slate-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
