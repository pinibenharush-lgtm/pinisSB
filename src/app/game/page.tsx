"use client";

import { useMemo } from "react";
import { PEOPLE, personName } from "@/lib/types";
import { getDailyPuzzle } from "@/lib/tango";
import { formatSeconds } from "@/lib/format";
import { computeStreak } from "@/lib/streak";
import { useGameStatus } from "@/lib/useGameStatus";
import PageHeader from "@/components/PageHeader";
import TangoBoard from "@/components/game/TangoBoard";

export default function GamePage() {
  const {
    today,
    loading,
    results,
    todayResults,
    solvedSeconds,
    saveError,
    recordSolved,
  } = useGameStatus();
  const puzzle = useMemo(() => getDailyPuzzle(today), [today]);

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
      <PageHeader eyebrow="Today's puzzle" title="🐱 Two Cats 🐈‍⬛" />

      {solvedSeconds != null ? (
        <div className="rounded-2xl border border-aegean-100 bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-stone-600">
            You solved today&apos;s puzzle in{" "}
            <span className="font-bold text-aegean-700">
              {formatSeconds(solvedSeconds)}
            </span>{" "}
            🎉
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Come back tomorrow for a new one.
          </p>
          {saveError && (
            <p className="mt-2 text-xs text-red-600">{saveError}</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
          <TangoBoard puzzle={puzzle} onSolved={recordSolved} />
        </div>
      )}

      <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Today&apos;s results
        </p>
        {loading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : todayResults.length === 0 ? (
          <p className="text-sm text-stone-400">Nobody has solved it yet.</p>
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
                    <span className="text-stone-400">{i + 1}.</span>{" "}
                    <span className="font-medium text-stone-700">
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

      <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Streaks
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PEOPLE.map((p) => (
            <div key={p.id} className="text-center">
              <p className="text-xs text-stone-500">{p.name}</p>
              <p
                className={`text-lg font-bold ${
                  streaks[p.id] > 0 ? "text-terracotta-600" : "text-aegean-700"
                }`}
              >
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
