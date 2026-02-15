import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import * as authApi from "@/integrations/supabase/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(id: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (!error) setProfile(data ?? null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, signUp: authApi.signUp, login: authApi.login, logout: authApi.logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
