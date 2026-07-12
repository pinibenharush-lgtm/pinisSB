/** Straight-line (great-circle) distance between two points, in km. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

/** Free, no-key place search via OpenStreetMap's Nominatim. */
export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
    query,
  )}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
