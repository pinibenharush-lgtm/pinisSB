"use client";

import { useEffect, useState } from "react";
import { useIdentity } from "./identity";
import { useRealtimeTable } from "./useRealtimeTable";
import { supabase } from "./supabase";
import { GameResult } from "./types";
import { todayISO } from "./format";

function localResultKey(today: string, me: string) {
  return `crete-trip-game-${today}-${me}`;
}

/** Shared "did I solve today's puzzle" state, used by both the Game page
 * and the Home dashboard's status card. Keeps a local per-device lock
 * (belt-and-suspenders) in case the shared save to Supabase fails. */
export function useGameStatus() {
  const { me } = useIdentity();
  const today = todayISO();

  const { rows: results, loading } = useRealtimeTable<GameResult>(
    "game_results",
    { column: "game_date", ascending: false },
  );

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
  const solvedSeconds = myResult?.seconds ?? localSeconds;

  const ranked = [...todayResults].sort((a, b) => a.seconds - b.seconds);
  const myRank = myResult ? ranked.findIndex((r) => r.id === myResult.id) + 1 : null;

  async function recordSolved(seconds: number) {
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

  return {
    today,
    loading,
    results,
    todayResults,
    solvedSeconds,
    myRank,
    totalToday: todayResults.length,
    saveError,
    recordSolved,
  };
}
