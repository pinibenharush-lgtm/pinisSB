"use client";

import { useEurToIlsRate, formatILS, formatRelativeTime } from "@/lib/exchangeRate";
import BalanceSnapshot from "@/components/home/BalanceSnapshot";
import GameStatusCard from "@/components/home/GameStatusCard";
import TripInfoSection from "@/components/home/TripInfoSection";

export default function HomePage() {
  const { rate, updatedAt, unavailable } = useEurToIlsRate();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800">Crete Trip 🇬🇷</h1>
        <p className="text-xs text-slate-400">
          {rate != null
            ? `1 € ≈ ${formatILS(1, rate)} (rate updated ${formatRelativeTime(updatedAt!)})`
            : unavailable
              ? "Exchange rate unavailable right now"
              : "Loading exchange rate…"}
        </p>
      </div>

      <BalanceSnapshot rate={rate} />
      <GameStatusCard />
      <TripInfoSection />
    </div>
  );
}
