"use client";

import { useEffect, useState } from "react";

const CACHE_KEY = "crete-trip-eur-ils-rate";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

type CachedRate = { rate: number; fetchedAt: number };

async function fetchFromFrankfurter(): Promise<number | null> {
  const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=ILS");
  if (!res.ok) return null;
  const data = await res.json();
  const rate = data?.rates?.ILS;
  return typeof rate === "number" ? rate : null;
}

async function fetchFromErApi(): Promise<number | null> {
  const res = await fetch("https://open.er-api.com/v6/latest/EUR");
  if (!res.ok) return null;
  const data = await res.json();
  const rate = data?.rates?.ILS;
  return typeof rate === "number" ? rate : null;
}

/** EUR -> ILS rate, tried against two independent free no-key sources
 * (ECB via frankfurter.app, then open.er-api.com) and cached locally.
 * Never fabricates a number: if both sources fail, rate is null. */
export function useEurToIlsRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cachedRaw = window.localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      try {
        const cached: CachedRate = JSON.parse(cachedRaw);
        if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- reading cached rate on mount
          setRate(cached.rate);
          setUpdatedAt(cached.fetchedAt);
        }
      } catch {
        // ignore malformed cache
      }
    }

    (async () => {
      let live: number | null = null;
      try {
        live = await fetchFromFrankfurter();
      } catch {
        live = null;
      }
      if (live == null) {
        try {
          live = await fetchFromErApi();
        } catch {
          live = null;
        }
      }

      if (cancelled) return;

      if (live != null) {
        const fetchedAt = Date.now();
        setRate(live);
        setUpdatedAt(fetchedAt);
        setUnavailable(false);
        window.localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ rate: live, fetchedAt } satisfies CachedRate),
        );
      } else {
        setUnavailable(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rate, updatedAt, unavailable };
}

export function formatILS(amountEur: number, rate: number): string {
  return `₪${(amountEur * rate).toFixed(2)}`;
}

/** Short relative time like "just now", "3h ago", "2d ago". */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
