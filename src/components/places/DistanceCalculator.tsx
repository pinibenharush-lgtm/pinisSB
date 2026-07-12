"use client";

import { useState } from "react";
import { Place } from "@/lib/types";
import { distanceKm } from "@/lib/geo";

export default function DistanceCalculator({ places }: { places: Place[] }) {
  const pinned = places.filter((p) => p.lat != null && p.lng != null);
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  if (pinned.length < 2) return null;

  const a = pinned.find((p) => p.id === aId);
  const b = pinned.find((p) => p.id === bId);
  const km =
    a && b && a.lat != null && a.lng != null && b.lat != null && b.lng != null
      ? distanceKm(
          { lat: a.lat, lng: a.lng },
          { lat: b.lat, lng: b.lng },
        )
      : null;

  return (
    <div className="rounded-xl border border-aegean-100 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Distance between places
      </p>
      <div className="flex items-center gap-2">
        <select
          value={aId}
          onChange={(e) => setAId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">From...</option>
          {pinned.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="text-slate-400">&harr;</span>
        <select
          value={bId}
          onChange={(e) => setBId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">To...</option>
          {pinned.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {km != null && (
        <p className="mt-2 text-sm">
          <span className="font-bold text-aegean-700">{km.toFixed(1)} km</span>{" "}
          <span className="text-slate-400">in a straight line</span>
        </p>
      )}
    </div>
  );
}
