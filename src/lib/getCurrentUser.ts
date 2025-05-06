import { cookies } from "next/headers";
import supabaseAdmin from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserWithCreatedAt() {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) return null;

  const userId = sessionData.session.user.id;

  const { data, error } = await supabaseAdmin
    .from("auth.users")
    .select("id, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data; // { id, created_at }
}
