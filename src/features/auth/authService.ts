import { apiRequest } from "@/lib/api";
import { UserProfile } from "@/types/domain";

export async function signUpWithEmail(email: string, password: string, name: string) {
  return apiRequest<{ token: string; user: UserProfile }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name })
  });
}

export async function signInWithEmail(email: string, password: string) {
  return apiRequest<{ token: string; user: UserProfile }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}
