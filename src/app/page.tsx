"use client";

import { useState } from "react";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { Expense } from "@/lib/types";
import BalanceSummary from "@/components/balance/BalanceSummary";
import ExpenseForm from "@/components/balance/ExpenseForm";
import ExpenseList from "@/components/balance/ExpenseList";

export default function BalancePage() {
  const { rows: expenses, loading } = useRealtimeTable<Expense>("expenses", {
    column: "expense_date",
    ascending: false,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <BalanceSummary expenses={expenses} />

      {formOpen ? (
        <ExpenseForm editing={editing} onDone={closeForm} />
      ) : (
        <button
          onClick={openAdd}
          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          + Add expense
        </button>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Expenses
        </p>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
        ) : (
          <ExpenseList expenses={expenses} onEdit={openEdit} />
        )}
      </div>
    </div>
  );
}
