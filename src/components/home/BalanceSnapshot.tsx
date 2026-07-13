"use client";

import Link from "next/link";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { Expense } from "@/lib/types";
import { computePocketBalances, POCKETS } from "@/lib/balance";
import { formatILS } from "@/lib/exchangeRate";

export default function BalanceSnapshot({ rate }: { rate: number | null }) {
  const { rows: expenses, loading } = useRealtimeTable<Expense>("expenses", {
    column: "expense_date",
    ascending: false,
  });
  const balances = computePocketBalances(expenses);

  return (
    <Link
      href="/balance"
      className="block rounded-xl border border-aegean-100 bg-white p-4 shadow-sm active:bg-aegean-50"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Balance
      </p>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {POCKETS.map((pocket) => {
            const amount = balances[pocket.id];
            const isEven = Math.abs(amount) < 0.005;
            return (
              <div key={pocket.id} className="text-center">
                <p className="text-xs text-slate-500">{pocket.name}</p>
                <p
                  className={`text-base font-bold ${
                    isEven
                      ? "text-slate-400"
                      : amount > 0
                        ? "text-emerald-600"
                        : "text-red-600"
                  }`}
                >
                  {isEven
                    ? "€0"
                    : `${amount > 0 ? "+" : "-"}€${Math.abs(amount).toFixed(2)}`}
                </p>
                {!isEven && rate != null && (
                  <p className="text-[10px] text-slate-400">
                    {formatILS(Math.abs(amount), rate)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Link>
  );
}
