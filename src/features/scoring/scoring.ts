import { Checkin, LeaderboardEntry, UserChallenge } from "@/types/domain";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date) {
  return Math.floor((toDateOnly(a) < toDateOnly(b) ? b.getTime() - a.getTime() : a.getTime() - b.getTime()) / DAY_MS);
}

export function getCurrentStreak(checkins: Checkin[]) {
  const days = Array.from(new Set(checkins.map((checkin) => checkin.checked_in_on))).sort().reverse();
  if (days.length === 0) {
    return 0;
  }

  const today = new Date();
  const mostRecent = new Date(`${days[0]}T12:00:00`);
  if (daysBetween(today, mostRecent) > 1) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    const previous = new Date(`${days[index - 1]}T12:00:00`);
    const current = new Date(`${days[index]}T12:00:00`);
    if (daysBetween(previous, current) === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function getWeeklyFrequency(checkins: Checkin[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
  return new Set(
    checkins
      .filter((checkin) => new Date(`${checkin.checked_in_on}T12:00:00`) >= weekAgo)
      .map((checkin) => checkin.checked_in_on)
  ).size;
}

export function calculateUserPoints(checkins: Checkin[], completedChallenges: UserChallenge[]) {
  const checkinPoints = checkins.length * 10;
  const streak = getCurrentStreak(checkins);
  const weeklyFrequency = getWeeklyFrequency(checkins);
  const challengePoints = completedChallenges.length * 30;
  const streakBonus = streak >= 5 ? 40 : streak >= 3 ? 20 : 0;
  const frequencyBonus = weeklyFrequency >= 4 ? 15 : weeklyFrequency >= 3 ? 10 : 0;
  const latest = checkins
    .map((checkin) => new Date(`${checkin.checked_in_on}T12:00:00`))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const inactivityPenalty = !latest || daysBetween(new Date(), latest) >= 7 ? -15 : 0;

  return Math.max(0, checkinPoints + challengePoints + streakBonus + frequencyBonus + inactivityPenalty);
}

export function buildLeaderboard(input: Array<{ userId: string; name: string; avatarUrl: string | null; checkins: Checkin[]; completedChallenges: UserChallenge[] }>): LeaderboardEntry[] {
  return input
    .map((item) => ({
      userId: item.userId,
      name: item.name,
      avatarUrl: item.avatarUrl,
      checkins: item.checkins.length,
      weeklyFrequency: getWeeklyFrequency(item.checkins),
      streak: getCurrentStreak(item.checkins),
      points: calculateUserPoints(item.checkins, item.completedChallenges),
      rank: 0
    }))
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
