"use client";

import { useEffect, useMemo, useState } from "react";
import { useIdentity } from "@/lib/identity";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { supabase } from "@/lib/supabase";
import { GameResult, PEOPLE, personName } from "@/lib/types";
import { getDailyPuzzle } from "@/lib/tango";
import { todayISO, formatSeconds } from "@/lib/format";
import { computeStreak } from "@/lib/streak";
import TangoBoard from "@/components/game/TangoBoard";

function localResultKey(today: string, me: string) {
  return `crete-trip-game-${today}-${me}`;
}

export default function GamePage() {
  const { me } = useIdentity();
  const today = todayISO();
  const puzzle = useMemo(() => getDailyPuzzle(today), [today]);

  const { rows: results, loading } = useRealtimeTable<GameResult>(
    "game_results",
    { column: "game_date", ascending: false },
  );

  // Belt-and-suspenders local lock: even if the save to Supabase fails
  // (e.g. offline, or the database isn't fully set up), this device won't
  // let the same person replay today's puzzle once they've solved it.
  const [localSeconds, setLocalSeconds] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    const stored = window.localStorage.getItem(localResultKey(today, me));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setLocalSeconds(stored ? parseInt(stored, 10) : null);
  }, [today, me]);

  const todayResults = results.filter((r) => r.game_date === today);
  const myResult = me ? todayResults.find((r) => r.person_id === me) : undefined;
  const solved = myResult ?? (localSeconds != null ? { seconds: localSeconds } : null);

  async function handleSolved(seconds: number) {
    if (!me) return;
    window.localStorage.setItem(localResultKey(today, me), String(seconds));
    setLocalSeconds(seconds);

    const { error } = await supabase
      .from("game_results")
      // Insert (not upsert): once a result exists for today it's final and
      // can't be overwritten by a later attempt (e.g. a stale second tab).
      .insert({ game_date: today, person_id: me, seconds });

    if (error && error.code !== "23505") {
      setSaveError(
        "Your score didn't save to the shared board (the game_results table may be missing — see README.md). It's saved on this device though.",
      );
    }
  }

  const streaks = Object.fromEntries(
    PEOPLE.map((p) => {
      const dates = results
        .filter((r) => r.person_id === p.id)
        .map((r) => r.game_date);
      return [p.id, computeStreak(dates, today)];
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Today&apos;s puzzle
        </p>
        <h1 className="text-lg font-bold text-slate-800">🐱 Two Cats 🐈‍⬛</h1>
      </div>

      {solved ? (
        <div className="rounded-xl border border-aegean-100 bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            You solved today&apos;s puzzle in{" "}
            <span className="font-bold text-aegean-700">
              {formatSeconds(solved.seconds)}
            </span>{" "}
            🎉
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Come back tomorrow for a new one.
          </p>
          {saveError && (
            <p className="mt-2 text-xs text-red-600">{saveError}</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-aegean-100 bg-white p-4 shadow-sm">
          <TangoBoard puzzle={puzzle} onSolved={handleSolved} />
        </div>
      )}

      <div className="rounded-xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Today&apos;s results
        </p>
        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : todayResults.length === 0 ? (
          <p className="text-sm text-slate-400">Nobody has solved it yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...todayResults]
              .sort((a, b) => a.seconds - b.seconds)
              .map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    <span className="text-slate-400">{i + 1}.</span>{" "}
                    <span className="font-medium text-slate-700">
                      {personName(r.person_id)}
                    </span>
                  </span>
                  <span className="font-bold text-aegean-700">
                    {formatSeconds(r.seconds)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Streaks
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PEOPLE.map((p) => (
            <div key={p.id} className="text-center">
              <p className="text-xs text-slate-500">{p.name}</p>
              <p className="text-lg font-bold text-aegean-700">
                {streaks[p.id]}
                {streaks[p.id] > 0 ? " 🔥" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
