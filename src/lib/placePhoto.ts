/** Free, no-key representative photo lookup via Wikipedia's search API. */
async function searchThumbnail(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
        query,
      )}&limit=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;

    const data: { pages?: { thumbnail?: { url?: string } }[] } =
      await res.json();
    const thumb = data.pages?.[0]?.thumbnail?.url;
    if (!thumb) return null;

    // Use the URL exactly as Wikipedia returns it — do not try to guess a
    // bigger-size variant by rewriting it, that produces broken image URLs.
    return thumb.startsWith("//") ? `https:${thumb}` : thumb;
  } catch {
    return null;
  }
}

export async function findPlacePhoto(name: string): Promise<string | null> {
  // Try with "Crete" appended first (disambiguates generic names), then
  // fall back to the bare name in case that match has no lead image.
  return (await searchThumbnail(`${name} Crete`)) ?? (await searchThumbnail(name));
}
