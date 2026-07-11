"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";

export default function PlaceForm({ onDone }: { onDone: () => void }) {
  const { me } = useIdentity();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Give the place a name");
      return;
    }

    setSaving(true);
    const { error: dbError } = await supabase.from("places").insert({
      name: name.trim(),
      link: link.trim() || null,
      notes: notes.trim() || null,
      created_by: me,
    });
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
          Place name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Balos Lagoon"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Link (website / Google Maps)
        </label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth knowing..."
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add place"}
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
