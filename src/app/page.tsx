"use client";

import { useEurToIlsRate } from "@/lib/exchangeRate";
import PageHeader from "@/components/PageHeader";
import ExchangeRateCard from "@/components/ExchangeRateCard";
import BalanceSnapshot from "@/components/home/BalanceSnapshot";
import GameStatusCard from "@/components/home/GameStatusCard";
import TripInfoSection from "@/components/home/TripInfoSection";

export default function HomePage() {
  const { rate, updatedAt, unavailable } = useEurToIlsRate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Crete Trip 🇬🇷" subtitle="Chania, Crete · September 2026" />

      <ExchangeRateCard rate={rate} updatedAt={updatedAt} unavailable={unavailable} />
      <BalanceSnapshot rate={rate} />
      <GameStatusCard />
      <TripInfoSection />
    </div>
  );
}
