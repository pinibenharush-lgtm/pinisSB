"use client";

import Link from "next/link";
import { useGameStatus } from "@/lib/useGameStatus";
import { formatSeconds } from "@/lib/format";

export default function GameStatusCard() {
  const { solvedSeconds, myRank, totalToday } = useGameStatus();

  return (
    <Link
      href="/game"
      className="block rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm active:bg-aegean-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Two Cats
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
        <span className="shrink-0 text-2xl">
          {solvedSeconds != null ? "🐱" : "🐱🐈‍⬛"}
        </span>
      </div>
    </Link>
  );
}
