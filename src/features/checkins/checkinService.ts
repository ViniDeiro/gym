import { supabase } from "@/lib/supabase";
import { Challenge, Checkin, WorkoutType } from "@/types/domain";
import { getCurrentStreak, getWeeklyFrequency } from "@/features/scoring/scoring";

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

export async function hasCheckedInToday(userId: string, leagueId: string) {
  const { data, error } = await supabase
    .from("checkins")
    .select("id")
    .eq("user_id", userId)
    .eq("league_id", leagueId)
    .eq("checked_in_on", todayDateOnly())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function createDailyCheckin(payload: {
  userId: string;
  leagueId: string;
  workoutType: WorkoutType;
  note?: string;
  photoUrl?: string | null;
}) {
  if (await hasCheckedInToday(payload.userId, payload.leagueId)) {
    throw new Error("Voce ja fez check-in nesta liga hoje.");
  }

  const { data, error } = await supabase
    .from("checkins")
    .insert({
      user_id: payload.userId,
      league_id: payload.leagueId,
      workout_type: payload.workoutType,
      note: payload.note || null,
      photo_url: payload.photoUrl ?? null,
      checked_in_on: todayDateOnly(),
      verification_status: payload.photoUrl ? "photo_pending" : "self_reported",
      anti_cheat_meta: {
        source: "manual",
        gps_ready: false,
        health_provider_ready: false
      }
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("posts").insert({
    league_id: payload.leagueId,
    user_id: payload.userId,
    checkin_id: data.id,
    message: `fez treino de ${payload.workoutType.replace("_", " ")} hoje`
  });

  await updateChallengeProgress(payload.userId, payload.leagueId);

  return data;
}

async function updateChallengeProgress(userId: string, leagueId: string) {
  const [{ data: challenges }, { data: checkins }] = await Promise.all([
    supabase.from("challenges").select("*").eq("league_id", leagueId).lte("starts_at", new Date().toISOString()).gte("ends_at", new Date().toISOString()),
    supabase.from("checkins").select("*").eq("league_id", leagueId).eq("user_id", userId)
  ]);

  const userCheckins = (checkins ?? []) as Checkin[];
  const activeChallenges = (challenges ?? []) as Challenge[];

  await Promise.all(
    activeChallenges.map((challenge) => {
      const progress = calculateProgress(challenge, userCheckins);
      const completed = progress >= challenge.target_value;

      return supabase.from("user_challenges").upsert({
        challenge_id: challenge.id,
        user_id: userId,
        progress: Math.min(progress, challenge.target_value),
        status: completed ? "completed" : "active",
        completed_at: completed ? new Date().toISOString() : null
      });
    })
  );
}

function calculateProgress(challenge: Challenge, checkins: Checkin[]) {
  if (challenge.challenge_type === "streak") {
    return getCurrentStreak(checkins);
  }

  if (challenge.challenge_type === "weekly_count") {
    return getWeeklyFrequency(checkins);
  }

  if (challenge.challenge_type === "workout_type_count") {
    return checkins.filter((checkin) => checkin.workout_type === challenge.workout_type).length;
  }

  if (challenge.challenge_type === "weekday") {
    return checkins.filter((checkin) => new Date(`${checkin.checked_in_on}T12:00:00`).getDay() === 1).length;
  }

  if (challenge.challenge_type === "monthly_count") {
    const month = new Date().toISOString().slice(0, 7);
    return checkins.filter((checkin) => checkin.checked_in_on.startsWith(month)).length;
  }

  return 0;
}
