"use client";

import { useEffect, useRef } from "react";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/lib/types";

export default function PlacesMap({ places }: { places: Place[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const pinned = places.filter(
    (p): p is Place & { lat: number; lng: number } =>
      p.lat != null && p.lng != null,
  );

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      // Leaflet is a CJS/UMD package; depending on the bundler's interop,
      // the real module can land on either `mod` or `mod.default`.
      const modUnknown = mod as unknown as { default?: typeof mod };
      const L = modUnknown.default ?? mod;

      // Default marker icons reference bundler-relative paths that break
      // under Next.js, so point them at the CDN instead.
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current).setView(
          [35.2401, 24.8093], // Crete
          9,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Clear old markers on re-render
      map.eachLayer((layer) => {
        if ((layer as L.Marker).options?.icon) map.removeLayer(layer);
      });

      if (pinned.length > 0) {
        const markers = pinned.map((place) =>
          L.marker([place.lat, place.lng])
            .addTo(map)
            .bindPopup(
              `<strong>${escapeHtml(place.name)}</strong>${
                place.notes
                  ? `<br/><span>${escapeHtml(place.notes)}</span>`
                  : ""
              }${
                place.link
                  ? `<br/><a href="${escapeAttr(place.link)}" target="_blank" rel="noopener noreferrer">Open link</a>`
                  : ""
              }`,
            ),
        );
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 13 });
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned.map((p) => `${p.id}:${p.lat}:${p.lng}`).join(",")]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (pinned.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-400">
        No places with a location yet. Search for one when adding a place.
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-2xl border border-aegean-100"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

function escapeAttr(s: string) {
  return escapeHtml(s);
}
