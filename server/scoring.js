const DAY_MS = 24 * 60 * 60 * 1000;

function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.floor(Math.abs(new Date(dateOnly(a)).getTime() - new Date(dateOnly(b)).getTime()) / DAY_MS);
}

function getCurrentStreak(checkins) {
  const days = Array.from(new Set(checkins.map((checkin) => dateOnly(checkin.checked_in_on)))).sort().reverse();
  if (days.length === 0) return 0;
  if (daysBetween(new Date(), days[0]) > 1) return 0;

  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (daysBetween(days[index - 1], days[index]) === 1) streak += 1;
    else break;
  }
  return streak;
}

function getWeeklyFrequency(checkins) {
  const weekAgo = new Date(Date.now() - 7 * DAY_MS);
  return new Set(checkins.filter((checkin) => new Date(checkin.checked_in_on) >= weekAgo).map((checkin) => dateOnly(checkin.checked_in_on))).size;
}

function calculateUserPoints(checkins, completedChallenges) {
  const streak = getCurrentStreak(checkins);
  const weeklyFrequency = getWeeklyFrequency(checkins);
  const latest = checkins.map((checkin) => new Date(checkin.checked_in_on)).sort((a, b) => b.getTime() - a.getTime())[0];
  const inactivityPenalty = !latest || daysBetween(new Date(), latest) >= 7 ? -15 : 0;
  const streakBonus = streak >= 5 ? 40 : streak >= 3 ? 20 : 0;
  const frequencyBonus = weeklyFrequency >= 4 ? 15 : weeklyFrequency >= 3 ? 10 : 0;

  return Math.max(0, checkins.length * 10 + completedChallenges.length * 30 + streakBonus + frequencyBonus + inactivityPenalty);
}

module.exports = { calculateUserPoints, getCurrentStreak, getWeeklyFrequency };
