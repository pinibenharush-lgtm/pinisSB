"use client";

import { useState } from "react";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { Place, PlaceComment, PlaceRating } from "@/lib/types";
import PlaceForm from "@/components/places/PlaceForm";
import PlaceCard from "@/components/places/PlaceCard";

export default function PlacesPage() {
  const { rows: places, loading } = useRealtimeTable<Place>("places", {
    column: "created_at",
    ascending: false,
  });
  const { rows: ratings } = useRealtimeTable<PlaceRating>("place_ratings", {
    column: "id",
  });
  const { rows: comments } = useRealtimeTable<PlaceComment>("place_comments", {
    column: "created_at",
  });
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {formOpen ? (
        <PlaceForm onDone={() => setFormOpen(false)} />
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          + Add place
        </button>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
      ) : places.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No places yet. Add somewhere you want to visit!
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.id}>
              <PlaceCard
                place={place}
                ratings={ratings.filter((r) => r.place_id === place.id)}
                comments={comments.filter((c) => c.place_id === place.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
