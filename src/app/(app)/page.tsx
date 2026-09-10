"use client";

import { useEurToIlsRate } from "@/lib/exchangeRate";
import PageHeader from "@/components/PageHeader";
import ExchangeRateCard from "@/components/ExchangeRateCard";
import CurrencyConverterCard from "@/components/CurrencyConverterCard";
import BalanceSnapshot from "@/components/home/BalanceSnapshot";
import GameStatusCard from "@/components/home/GameStatusCard";
import TutStatusCard from "@/components/home/TutStatusCard";
import TripInfoSection from "@/components/home/TripInfoSection";

export default function HomePage() {
  const { rate, updatedAt, unavailable } = useEurToIlsRate();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Crete Trip 🇬🇷" subtitle="Chania, Crete · September 2026" />

      <ExchangeRateCard rate={rate} updatedAt={updatedAt} unavailable={unavailable} />
      <CurrencyConverterCard rate={rate} />
      <BalanceSnapshot rate={rate} />
      <div className="grid grid-cols-2 gap-3">
        <GameStatusCard />
        <TutStatusCard />
      </div>
      <TripInfoSection />
    </div>
  );
}
