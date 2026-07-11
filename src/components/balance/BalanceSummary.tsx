import { computePocketBalances, computeSettlements, POCKETS } from "@/lib/balance";
import { Expense } from "@/lib/types";

export default function BalanceSummary({ expenses }: { expenses: Expense[] }) {
  const balances = computePocketBalances(expenses);
  const settlements = computeSettlements(balances);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {POCKETS.map((pocket) => {
          const amount = balances[pocket.id];
          const isEven = Math.abs(amount) < 0.005;
          return (
            <div
              key={pocket.id}
              className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{pocket.name}</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  isEven
                    ? "text-slate-400"
                    : amount > 0
                      ? "text-emerald-600"
                      : "text-red-600"
                }`}
              >
                {isEven ? "€0" : `${amount > 0 ? "+" : "-"}€${Math.abs(amount).toFixed(2)}`}
              </p>
              <p className="text-[10px] text-slate-400">
                {isEven ? "settled up" : amount > 0 ? "is owed" : "owes"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Settle up
        </p>
        {settlements.length === 0 ? (
          <p className="text-sm text-slate-400">Everyone&apos;s even 🎉</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {settlements.map((s, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold text-slate-700">
                    {POCKETS.find((p) => p.id === s.from)?.name}
                  </span>{" "}
                  <span className="text-slate-400">pays</span>{" "}
                  <span className="font-semibold text-slate-700">
                    {POCKETS.find((p) => p.id === s.to)?.name}
                  </span>
                </span>
                <span className="font-bold text-cyan-700">
                  €{s.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
