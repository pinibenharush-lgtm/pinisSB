"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { formatILS } from "@/lib/exchangeRate";

export default function CurrencyConverterCard({ rate }: { rate: number | null }) {
  const [amount, setAmount] = useState("");
  const parsed = parseFloat(amount);
  const hasAmount = amount.trim() !== "" && !Number.isNaN(parsed);

  return (
    <div className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aegean-50 text-aegean-700">
          <Calculator className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Converter
        </p>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
            €
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={rate == null}
            placeholder="0"
            className="w-full rounded-xl border border-stone-300 py-2 pl-7 pr-3 text-base tabular-nums text-stone-800 disabled:bg-stone-50 disabled:text-stone-400"
          />
        </div>
        <span className="text-stone-400">=</span>
        <p className="flex-1 truncate text-lg font-semibold tabular-nums text-aegean-700">
          {rate == null
            ? "—"
            : hasAmount
              ? formatILS(parsed, rate)
              : "₪0.00"}
        </p>
      </div>
      {rate == null && (
        <p className="mt-2 text-xs text-stone-400">
          Converter needs a live exchange rate to work.
        </p>
      )}
    </div>
  );
}
