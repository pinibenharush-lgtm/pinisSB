"use client";

import { useState } from "react";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { MapPin } from "lucide-react";
import { Place, PlaceComment, PlaceRating } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import PublicPlaceCard from "@/components/places/PublicPlaceCard";
import PlacesMap from "@/components/places/PlacesMap";

export default function SharedPlacesPage() {
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
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pb-10 pt-6 md:max-w-2xl md:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">
          Crete Trip 🇬🇷 &middot; Places
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Where we went and what we recommend
        </p>
      </div>

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
          message="No places have been added yet."
        />
      ) : view === "map" ? (
        <PlacesMap places={places} />
      ) : (
        <ul className="flex flex-col gap-3">
          {places.map((place) => (
            <li key={place.id}>
              <PublicPlaceCard
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
