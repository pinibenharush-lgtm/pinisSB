"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { ChecklistItem, personName } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

export default function ChecklistPage() {
  const { me } = useIdentity();
  const { rows: items, loading } = useRealtimeTable<ChecklistItem>(
    "checklist_items",
    { column: "created_at" },
  );
  const [text, setText] = useState("");

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await supabase.from("checklist_items").insert({
      text: text.trim(),
      created_by: me,
    });
    setText("");
  }

  async function toggleDone(item: ChecklistItem) {
    await supabase
      .from("checklist_items")
      .update({
        done: !item.done,
        done_by: !item.done ? me : null,
      })
      .eq("id", item.id);
  }

  async function deleteItem(id: string) {
    await supabase.from("checklist_items").delete().eq("id", id);
  }

  const sorted = [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Checklist" subtitle="Don't forget the important stuff" />

      <form onSubmit={addItem} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Take passports"
          className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-aegean-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="py-8 text-center text-sm text-stone-400">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400">
          Nothing on the list yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-aegean-100 bg-white p-3 shadow-sm"
            >
              <button
                onClick={() => toggleDone(item)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                  item.done
                    ? "border-aegean-600 bg-aegean-600 text-white"
                    : "border-stone-300 text-transparent"
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm ${
                    item.done ? "text-stone-400 line-through" : "text-stone-800"
                  }`}
                >
                  {item.text}
                </p>
                <p className="text-[11px] text-stone-400">
                  {item.done
                    ? `checked by ${personName(item.done_by)}`
                    : item.created_by
                      ? `added by ${personName(item.created_by)}`
                      : ""}
                </p>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="shrink-0 text-xs font-medium text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
