"use client";

import { computePocketBalances, computeSettlements, POCKETS } from "@/lib/balance";
import { Expense } from "@/lib/types";
import { formatILS, useEurToIlsRate } from "@/lib/exchangeRate";
import ExchangeRateCard from "@/components/ExchangeRateCard";

export default function BalanceSummary({ expenses }: { expenses: Expense[] }) {
  const balances = computePocketBalances(expenses);
  const settlements = computeSettlements(balances);
  const { rate, updatedAt, unavailable } = useEurToIlsRate();

  return (
    <div className="flex flex-col gap-3">
      <ExchangeRateCard rate={rate} updatedAt={updatedAt} unavailable={unavailable} />

      <div className="grid grid-cols-2 gap-2">
        {POCKETS.map((pocket) => {
          const amount = balances[pocket.id];
          const isEven = Math.abs(amount) < 0.005;
          return (
            <div
              key={pocket.id}
              className={`rounded-2xl border p-3 text-center shadow-sm ${
                isEven
                  ? "border-stone-200 bg-white"
                  : amount > 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
              }`}
            >
              <p className="text-xs font-medium text-stone-500">{pocket.name}</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  isEven
                    ? "text-stone-400"
                    : amount > 0
                      ? "text-emerald-600"
                      : "text-red-600"
                }`}
              >
                {isEven ? "€0" : `${amount > 0 ? "+" : "-"}€${Math.abs(amount).toFixed(2)}`}
              </p>
              {!isEven && rate != null && (
                <p className="text-[11px] text-stone-400">
                  {amount > 0 ? "+" : "-"}
                  {formatILS(Math.abs(amount), rate)}
                </p>
              )}
              <p className="text-[10px] text-stone-400">
                {isEven ? "settled up" : amount > 0 ? "is owed" : "owes"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Settle up
        </p>
        {settlements.length === 0 ? (
          <p className="text-sm text-stone-400">Everyone&apos;s even 🎉</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {settlements.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold text-stone-700">
                    {POCKETS.find((p) => p.id === s.from)?.name}
                  </span>{" "}
                  <span className="text-stone-400">pays</span>{" "}
                  <span className="font-semibold text-stone-700">
                    {POCKETS.find((p) => p.id === s.to)?.name}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-aegean-700">
                    €{s.amount.toFixed(2)}
                  </span>
                  {rate != null && (
                    <span className="block text-[11px] font-normal text-stone-400">
                      {formatILS(s.amount, rate)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
