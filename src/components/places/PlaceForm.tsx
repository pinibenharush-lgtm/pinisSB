"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";
import { NominatimResult, searchPlaces } from "@/lib/geo";
import { findPlacePhoto } from "@/lib/placePhoto";

export default function PlaceForm({ onDone }: { onDone: () => void }) {
  const { me } = useIdentity();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locationQuery, setLocationQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setSearching(true);
    setResults(await searchPlaces(locationQuery));
    setSearching(false);
  }

  function pickResult(result: NominatimResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPicked({ lat, lng });
    setResults([]);
    setLocationQuery(result.display_name);
    if (!name.trim()) setName(result.display_name.split(",")[0]);
    if (!link.trim()) {
      setLink(`https://www.google.com/maps?q=${lat},${lng}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Give the place a name");
      return;
    }

    setSaving(true);
    const photoUrl = await findPlacePhoto(name.trim());
    const { error: dbError } = await supabase.from("places").insert({
      name: name.trim(),
      link: link.trim() || null,
      notes: notes.trim() || null,
      lat: picked?.lat ?? null,
      lng: picked?.lng ?? null,
      photo_url: photoUrl,
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
      className="flex flex-col gap-3 rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Find it on the map (optional)
        </label>
        <div className="flex gap-2">
          <input
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setPicked(null);
            }}
            placeholder="Search a place in Crete..."
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="rounded-lg border border-aegean-600 px-3 py-2 text-xs font-semibold text-aegean-700 disabled:opacity-50"
          >
            {searching ? "..." : "Search"}
          </button>
        </div>
        {results.length > 0 && (
          <ul className="mt-1 flex flex-col divide-y divide-stone-100 rounded-lg border border-stone-200 bg-white">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="w-full px-3 py-2 text-left text-xs text-stone-600 hover:bg-aegean-50"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {picked && (
          <p className="mt-1 text-xs text-emerald-600">
            📍 Location set &mdash; this place will show on the map.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Place name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Balos Lagoon"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Link (website / Google Maps)
        </label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-500">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything worth knowing..."
          rows={2}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-aegean-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add place"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
