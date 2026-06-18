import { supabase } from "@/lib/supabase";

export async function updateProfile(userId: string, payload: { name: string; avatar_url?: string | null; goal?: string | null; current_gym?: string | null }) {
  const { error } = await supabase
    .from("users")
    .update({
      name: payload.name,
      avatar_url: payload.avatar_url ?? null,
      goal: payload.goal ?? null,
      current_gym: payload.current_gym ?? null
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
