import { supabase } from "@/lib/supabase";

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      email,
      name,
      avatar_url: null,
      goal: null,
      current_gym: null
    });
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
}
