import { ArrowLeftRight } from "lucide-react";
import { formatILS, formatRelativeTime } from "@/lib/exchangeRate";

export default function ExchangeRateCard({
  rate,
  updatedAt,
  unavailable,
}: {
  rate: number | null;
  updatedAt: number | null;
  unavailable: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-aegean-600 to-aegean-800 shadow-md shadow-aegean-900/10">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-aegean-200">
            Exchange rate
          </p>
          {rate != null ? (
            <>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white tabular-nums">
                €1 = {formatILS(1, rate)}
              </p>
              <p className="mt-0.5 text-xs text-aegean-200">
                {updatedAt ? `Updated ${formatRelativeTime(updatedAt)}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm font-medium text-aegean-100">
              {unavailable
                ? "Rate unavailable right now"
                : "Loading exchange rate…"}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
          <ArrowLeftRight className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
