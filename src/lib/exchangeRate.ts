"use client";

import { useEffect, useState } from "react";

const CACHE_KEY = "crete-trip-eur-ils-rate";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
// Approximate fallback, only used if we can't reach the live rate at all.
const FALLBACK_RATE = 3.95;

type CachedRate = { rate: number; fetchedAt: number };

/** EUR -> ILS rate, refreshed from a free no-key API and cached locally. */
export function useEurToIlsRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let haveValue = false;

    const cachedRaw = window.localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      try {
        const cached: CachedRate = JSON.parse(cachedRaw);
        if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- reading cached rate on mount
          setRate(cached.rate);
          setIsLive(true);
          haveValue = true;
        }
      } catch {
        // ignore malformed cache
      }
    }

    fetch("https://api.frankfurter.app/latest?from=EUR&to=ILS")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const live = data?.rates?.ILS;
        if (typeof live === "number") {
          setRate(live);
          setIsLive(true);
          window.localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ rate: live, fetchedAt: Date.now() } satisfies CachedRate),
          );
        } else if (!haveValue) {
          setRate(FALLBACK_RATE);
          setIsLive(false);
        }
      })
      .catch(() => {
        if (!cancelled && !haveValue) {
          setRate(FALLBACK_RATE);
          setIsLive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rate, isLive };
}

export function formatILS(amountEur: number, rate: number): string {
  return `₪${(amountEur * rate).toFixed(0)}`;
}
