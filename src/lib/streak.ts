/** Consecutive-day streak ending today (or yesterday, if today isn't played
 * yet) given the set of dates ("YYYY-MM-DD") a person has played. */
export function computeStreak(playedDates: string[], todayStr: string): number {
  const played = new Set(playedDates);
  const cursor = new Date(`${todayStr}T00:00:00Z`);
  if (!played.has(todayStr)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (played.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
