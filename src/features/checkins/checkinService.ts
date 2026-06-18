import { apiRequest } from "@/lib/api";
import { WorkoutType } from "@/types/domain";

export async function hasCheckedInToday(_userId: string, leagueId: string) {
  const data = await apiRequest<{ checkedIn: boolean }>(`/leagues/${leagueId}/checkins/today`);
  return data.checkedIn;
}

export async function createDailyCheckin(payload: {
  userId: string;
  leagueId: string;
  workoutType: WorkoutType;
  note?: string;
  photoUrl?: string | null;
}) {
  const data = await apiRequest<{ checkin: unknown }>(`/leagues/${payload.leagueId}/checkins`, {
    method: "POST",
    body: JSON.stringify({
      workoutType: payload.workoutType,
      note: payload.note,
      photoUrl: payload.photoUrl
    })
  });
  return data.checkin;
}
