// lib/profile.js
import { supabase } from "./supabaseClient";

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,theme")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function upsertProfile(profile) {
  // profile = { id, email, role, theme }
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
