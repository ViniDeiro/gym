import { apiRequest } from "@/lib/api";
import { Challenge, League, LeagueMember, LeaderboardEntry, UserChallenge } from "@/types/domain";

export async function createLeague(_userId: string, payload: { name: string; description: string; coverUrl?: string | null }) {
  const data = await apiRequest<{ league: League }>("/leagues", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.league;
}

export async function joinLeagueByCode(_userId: string, code: string) {
  const data = await apiRequest<{ league: League }>("/leagues/join", {
    method: "POST",
    body: JSON.stringify({ code })
  });
  return data.league;
}

export async function listMyLeagues(_userId: string) {
  const data = await apiRequest<{ leagues: League[] }>("/leagues");
  return data.leagues;
}

export async function getLeagueDetails(leagueId: string) {
  return apiRequest<{ league: League; members: LeagueMember[]; challenges: Challenge[] }>(`/leagues/${leagueId}`);
}

export async function getLeagueLeaderboard(leagueId: string) {
  const data = await apiRequest<{ ranking: LeaderboardEntry[] }>(`/leagues/${leagueId}/ranking`);
  return data.ranking;
}

export async function getMyChallengeProgress(leagueId: string, _userId: string) {
  const data = await apiRequest<{ progress: UserChallenge[] }>(`/leagues/${leagueId}/challenge-progress`);
  return data.progress;
}
