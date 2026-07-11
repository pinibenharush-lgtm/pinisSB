import { computeBalances, computeSettlements } from "@/lib/balance";
import { Expense, PEOPLE, personName } from "@/lib/types";

export default function BalanceSummary({ expenses }: { expenses: Expense[] }) {
  const balances = computeBalances(expenses);
  const settlements = computeSettlements(balances);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {PEOPLE.map((p) => {
          const amount = balances[p.id];
          const isEven = Math.abs(amount) < 0.005;
          return (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm"
            >
              <p className="text-xs font-medium text-slate-500">{p.name}</p>
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
                    {personName(s.from)}
                  </span>{" "}
                  <span className="text-slate-400">pays</span>{" "}
                  <span className="font-semibold text-slate-700">
                    {personName(s.to)}
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
