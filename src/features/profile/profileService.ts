import { apiRequest } from "@/lib/api";

export async function updateProfile(_userId: string, payload: { name: string; avatar_url?: string | null; goal?: string | null; current_gym?: string | null }) {
  await apiRequest("/me", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
