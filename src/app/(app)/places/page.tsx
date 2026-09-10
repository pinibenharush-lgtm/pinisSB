"use client";

import { useState } from "react";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { MapPin } from "lucide-react";
import { Place, PlaceComment, PlaceRating } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import PlaceForm from "@/components/places/PlaceForm";
import PlaceCard from "@/components/places/PlaceCard";
import PlacesMap from "@/components/places/PlacesMap";
import DistanceCalculator from "@/components/places/DistanceCalculator";

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
  const [editing, setEditing] = useState<Place | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(place: Place) {
    setEditing(place);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Places" subtitle="Where to go in Crete" />

      {formOpen ? (
        <PlaceForm editing={editing} onDone={closeForm} />
      ) : (
        <button
          onClick={openAdd}
          className="rounded-2xl bg-aegean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          + Add place
        </button>
      )}

      {places.length > 0 && (
        <div className="flex gap-1 rounded-full bg-stone-100 p-1">
          <button
            onClick={() => setView("list")}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-white text-aegean-700 shadow-sm"
                : "text-stone-500"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
              view === "map"
                ? "bg-white text-aegean-700 shadow-sm"
                : "text-stone-500"
            }`}
          >
            Map
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-stone-400">Loading…</p>
      ) : places.length === 0 ? (
        <EmptyState
          icon={<MapPin className="mx-auto h-6 w-6" />}
          message="No places yet. Add somewhere you want to visit!"
        />
      ) : view === "map" ? (
        <>
          <PlacesMap places={places} />
          <DistanceCalculator places={places} />
        </>
      ) : (
        <ul className="flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.id}>
              <PlaceCard
                place={place}
                ratings={ratings.filter((r) => r.place_id === place.id)}
                comments={comments.filter((c) => c.place_id === place.id)}
                onEdit={openEdit}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
