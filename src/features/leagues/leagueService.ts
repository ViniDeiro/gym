import { supabase } from "@/lib/supabase";
import { buildLeaderboard } from "@/features/scoring/scoring";
import { Checkin, Challenge, League, LeagueMember, UserChallenge } from "@/types/domain";

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createLeague(userId: string, payload: { name: string; description: string; coverUrl?: string | null }) {
  const inviteCode = makeInviteCode();
  const { data, error } = await supabase
    .from("leagues")
    .insert({
      owner_id: userId,
      name: payload.name,
      description: payload.description,
      cover_url: payload.coverUrl ?? null,
      invite_code: inviteCode
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("league_members").insert({
    league_id: data.id,
    user_id: userId,
    role: "owner"
  });

  await seedDefaultChallenges(data.id);
  return data as League;
}

export async function joinLeagueByCode(userId: string, code: string) {
  const { data: league, error } = await supabase.rpc("join_league_by_code", {
    target_code: code.trim().toUpperCase()
  });
  if (error) {
    throw error;
  }

  return league as League;
}

export async function listMyLeagues(userId: string) {
  const { data, error } = await supabase
    .from("league_members")
    .select("*, leagues(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: any) => row.leagues as League);
}

export async function getLeagueDetails(leagueId: string) {
  const [{ data: league, error: leagueError }, { data: members, error: membersError }, { data: challenges, error: challengesError }] = await Promise.all([
    supabase.from("leagues").select("*").eq("id", leagueId).single(),
    supabase.from("league_members").select("*, users(*)").eq("league_id", leagueId),
    supabase.from("challenges").select("*").eq("league_id", leagueId).order("starts_at", { ascending: false })
  ]);

  if (leagueError) throw leagueError;
  if (membersError) throw membersError;
  if (challengesError) throw challengesError;

  return {
    league: league as League,
    members: (members ?? []) as LeagueMember[],
    challenges: (challenges ?? []) as Challenge[]
  };
}

export async function getLeagueLeaderboard(leagueId: string) {
  const [{ data: members, error: membersError }, { data: checkins, error: checkinsError }, { data: userChallenges, error: challengeError }] = await Promise.all([
    supabase.from("league_members").select("*, users(*)").eq("league_id", leagueId),
    supabase.from("checkins").select("*").eq("league_id", leagueId),
    supabase.from("user_challenges").select("*, challenges!inner(league_id)").eq("challenges.league_id", leagueId).eq("status", "completed")
  ]);

  if (membersError) throw membersError;
  if (checkinsError) throw checkinsError;
  if (challengeError) throw challengeError;

  return buildLeaderboard(
    ((members ?? []) as LeagueMember[]).map((member) => ({
      userId: member.user_id,
      name: member.users?.name ?? "Atleta",
      avatarUrl: member.users?.avatar_url ?? null,
      checkins: ((checkins ?? []) as Checkin[]).filter((checkin) => checkin.user_id === member.user_id),
      completedChallenges: ((userChallenges ?? []) as UserChallenge[]).filter((challenge) => challenge.user_id === member.user_id)
    }))
  );
}

export async function getMyChallengeProgress(leagueId: string, userId: string) {
  const { data, error } = await supabase
    .from("user_challenges")
    .select("*, challenges!inner(league_id)")
    .eq("user_id", userId)
    .eq("challenges.league_id", leagueId);

  if (error) {
    throw error;
  }

  return (data ?? []) as UserChallenge[];
}

async function seedDefaultChallenges(leagueId: string) {
  const now = new Date();
  const startsAt = now.toISOString();
  const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("challenges").insert([
    {
      league_id: leagueId,
      title: "Treinar 3x na semana",
      description: "Complete tres check-ins em uma mesma semana.",
      points: 30,
      challenge_type: "weekly_count",
      target_value: 3,
      starts_at: startsAt,
      ends_at: endsAt
    },
    {
      league_id: leagueId,
      title: "5 dias seguidos",
      description: "Mantenha uma sequencia de cinco dias treinando.",
      points: 40,
      challenge_type: "streak",
      target_value: 5,
      starts_at: startsAt,
      ends_at: endsAt
    },
    {
      league_id: leagueId,
      title: "Cardio 3x na semana",
      description: "Faça tres treinos de cardio em uma semana.",
      points: 30,
      challenge_type: "workout_type_count",
      workout_type: "cardio",
      target_value: 3,
      starts_at: startsAt,
      ends_at: endsAt
    }
  ]);
}
