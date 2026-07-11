"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";
import { Expense, PEOPLE, PersonId } from "@/lib/types";

const ALL_IDS = PEOPLE.map((p) => p.id);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm({
  editing,
  onDone,
}: {
  editing?: Expense | null;
  onDone: () => void;
}) {
  const { me } = useIdentity();
  const [description, setDescription] = useState(editing?.description ?? "");
  const [amount, setAmount] = useState(
    editing ? String(editing.amount) : "",
  );
  const [paidBy, setPaidBy] = useState<PersonId>(
    editing?.paid_by ?? me ?? "pini",
  );
  const [participants, setParticipants] = useState<PersonId[]>(
    editing?.participants ?? ALL_IDS,
  );
  const [date, setDate] = useState(editing?.expense_date ?? todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleParticipant(id: PersonId) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError("Add a description");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (participants.length === 0) {
      setError("Pick at least one person to split with");
      return;
    }

    setSaving(true);
    const payload = {
      description: description.trim(),
      amount: parsedAmount,
      currency: "EUR",
      paid_by: paidBy,
      participants,
      expense_date: date,
    };

    const { error: dbError } = editing
      ? await supabase.from("expenses").update(payload).eq("id", editing.id)
      : await supabase.from("expenses").insert(payload);

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          What was it for?
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Hotel room, Groceries, Taxi"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Amount (€)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Date
          </label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Who paid?
        </label>
        <div className="flex gap-2">
          {PEOPLE.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setPaidBy(p.id)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                paidBy === p.id
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Split between
        </label>
        <div className="flex gap-2">
          {PEOPLE.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => toggleParticipant(p.id)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                participants.includes(p.id)
                  ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                  : "border-slate-300 text-slate-400"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        {participants.length > 0 && (
          <p className="mt-1 text-xs text-slate-400">
            €
            {amount && !isNaN(parseFloat(amount))
              ? (parseFloat(amount) / participants.length).toFixed(2)
              : "0.00"}{" "}
            each
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : editing ? "Save changes" : "Add expense"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
