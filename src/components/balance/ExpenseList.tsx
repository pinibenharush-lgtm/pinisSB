"use client";

import { supabase } from "@/lib/supabase";
import { Expense, personName } from "@/lib/types";

export default function ExpenseList({
  expenses,
  onEdit,
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}) {
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
  }

  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No expenses yet. Add the first one above.
      </p>
    );
  }

  const sorted = [...expenses].sort(
    (a, b) =>
      new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime() ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((expense) => (
        <li
          key={expense.id}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">
                {expense.description}
              </p>
              <p className="text-xs text-slate-400">
                {expense.expense_date} &middot; paid by{" "}
                <span className="font-medium text-slate-500">
                  {personName(expense.paid_by)}
                </span>{" "}
                &middot; split{" "}
                {expense.participants.map((p) => personName(p)).join(", ")}
              </p>
            </div>
            <p className="shrink-0 font-bold text-slate-800">
              €{expense.amount.toFixed(2)}
            </p>
          </div>
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => onEdit(expense)}
              className="text-xs font-medium text-cyan-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(expense.id)}
              className="text-xs font-medium text-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
