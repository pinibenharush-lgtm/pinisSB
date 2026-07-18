/** Free, no-key representative photo lookup via Wikipedia's search API. */
export async function findPlacePhoto(name: string): Promise<string | null> {
  const query = `${name} Crete`;
  const url = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
    query,
  )}&limit=1`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data: { pages?: { thumbnail?: { url?: string } }[] } =
      await res.json();
    const thumb = data.pages?.[0]?.thumbnail?.url;
    if (!thumb) return null;

    const fullUrl = thumb.startsWith("//") ? `https:${thumb}` : thumb;
    // Wikipedia thumbnail URLs encode the rendered width, e.g.
    // ".../250px-Foo.jpg" — bump it up for a less blurry cover photo.
    return fullUrl.replace(/\/\d+px-/, "/800px-");
  } catch {
    return null;
  }
}
