"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Loads all rows from a table and keeps them in sync with Supabase realtime
 * so every device sees the same data without manual refreshing.
 */
export function useRealtimeTable<T extends { id: string }>(
  table: string,
  orderBy: { column: string; ascending?: boolean },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy.column, { ascending: orderBy.ascending ?? true });
    if (!error && data) setRows(data as T[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    reload();

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          reload();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { rows, loading, reload };
}
