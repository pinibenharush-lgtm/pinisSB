"use client";

import { useMemo } from "react";
import { PEOPLE, personName } from "@/lib/types";
import { getDailyTutPuzzle } from "@/lib/tut";
import { formatSeconds } from "@/lib/format";
import { computeStreak } from "@/lib/streak";
import { useTutStatus } from "@/lib/useTutStatus";
import { useIdentity } from "@/lib/identity";
import PageHeader from "@/components/PageHeader";
import TutBoard from "@/components/game/TutBoard";

export default function TutPage() {
  const { me } = useIdentity();
  const {
    today,
    loading,
    results,
    todayResults,
    solvedSeconds,
    saveError,
    recordSolved,
    removeMyResult,
  } = useTutStatus();
  const puzzle = useMemo(() => getDailyTutPuzzle(today), [today]);

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
      <PageHeader eyebrow="Today's puzzle" title="🍓 Tut" />

      <div
        dir="rtl"
        className="rounded-2xl border border-aegean-100 bg-aegean-50/60 p-4 text-sm text-stone-700"
      >
        <p className="mb-2 font-semibold text-aegean-700">איך משחקים?</p>
        <ul className="list-disc space-y-1 pr-4">
          <li>שמים תות 🍓 אחד בדיוק בכל שורה, בכל טור ובכל אזור צבע</li>
          <li>אסור לשני תותים לגעת זה בזה, גם באלכסון</li>
          <li>
            לוחצים על משבצת כדי להחליף: ריק ← ✕ ← 🍓 ← ריק (ה־✕ עוזר לסמן
            משבצות שבטוח לא מתאימות)
          </li>
        </ul>
      </div>

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
          <TutBoard puzzle={puzzle} onSolved={recordSolved} />
        </div>
      )}

      <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Today&apos;s results
        </p>
        {loading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...todayResults]
              .sort((a, b) => a.seconds - b.seconds)
              .map((r, i) => (
                <li
                  key={r.id}
                  className={`flex items-center justify-between rounded-xl px-2 py-1.5 text-sm ${
                    i === 0 ? "bg-terracotta-50" : ""
                  }`}
                >
                  <span>
                    <span
                      className={
                        i === 0 ? "text-terracotta-600" : "text-stone-400"
                      }
                    >
                      {i === 0 ? "🥇" : `${i + 1}.`}
                    </span>{" "}
                    <span className="font-medium text-stone-700">
                      {personName(r.person_id)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-aegean-700">
                      {formatSeconds(r.seconds)}
                    </span>
                    {r.person_id === me && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Remove this result? Only do this if it wasn't actually you — you'll then be able to play today's puzzle for real.",
                            )
                          ) {
                            removeMyResult();
                          }
                        }}
                        className="text-[11px] font-medium text-red-600"
                      >
                        Not you?
                      </button>
                    )}
                  </span>
                </li>
              ))}
            {PEOPLE.filter(
              (p) => !todayResults.some((r) => r.person_id === p.id),
            ).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm"
              >
                <span className="font-medium text-stone-500">{p.name}</span>
                <span className="text-xs text-stone-400">
                  Hasn&apos;t played yet
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
