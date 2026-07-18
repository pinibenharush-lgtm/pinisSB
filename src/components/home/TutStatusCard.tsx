"use client";

import Link from "next/link";
import { useTutStatus } from "@/lib/useTutStatus";
import { formatSeconds } from "@/lib/format";

export default function TutStatusCard() {
  const { solvedSeconds, myRank, totalToday } = useTutStatus();

  return (
    <Link
      href="/game?g=tut"
      className="block rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm active:bg-aegean-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Tut
          </p>
          {solvedSeconds != null ? (
            <p className="mt-0.5 text-sm text-stone-600">
              Solved in{" "}
              <span className="font-bold text-aegean-700">
                {formatSeconds(solvedSeconds)}
              </span>
              {myRank ? (
                <span className="text-stone-400">
                  {" "}
                  · #{myRank} of {totalToday} today
                </span>
              ) : null}
            </p>
          ) : (
            <p className="mt-0.5 text-sm font-semibold text-aegean-700">
              A new puzzle is waiting for you! 🎉
            </p>
          )}
        </div>
        <span className="shrink-0 text-2xl">🍓</span>
      </div>
    </Link>
  );
}
