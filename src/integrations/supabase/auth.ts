import { supabase } from "./client";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // create profile row if user created
  if (data.user?.id) {
    await supabase.from("profiles").insert({ id: data.user.id });
  }

  return data;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function uploadImage(file: File, userId: string) {
  const path = `user/${userId}/${Date.now()}.png`;
  const { data, error } = await supabase.storage.from("cube-images").upload(path, file);
  if (error) throw error;
  return data;
}

export async function saveSolve(userId: string, scramble: string, solution: string, time_ms?: number, image_path?: string) {
  const payload: any = { user_id: userId, scramble, solution };
  if (typeof time_ms === "number") payload.time_ms = time_ms;
  if (image_path) payload.image_path = image_path;

  const { data, error } = await supabase.from("solves").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function fetchSolves(userId?: string) {
  let query = supabase.from("solves").select("*").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
