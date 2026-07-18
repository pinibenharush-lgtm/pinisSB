/** Free, no-key representative photo lookup via Wikipedia's public APIs. */
export async function findPlacePhoto(name: string): Promise<string | null> {
  const query = `${name} Crete`;

  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
        query,
      )}&limit=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!searchRes.ok) return null;

    const searchData: { pages?: { title?: string }[] } = await searchRes.json();
    const title = searchData.pages?.[0]?.title;
    if (!title) return null;

    // Ask for a properly-sized thumbnail via the officially supported
    // pageimages API, instead of guessing at the search API's (much
    // smaller, fixed-size) thumbnail URL format.
    const imageRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        title,
      )}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
      { headers: { Accept: "application/json" } },
    );
    if (!imageRes.ok) return null;

    const imageData: {
      query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
    } = await imageRes.json();
    const pages = imageData.query?.pages;
    if (!pages) return null;

    return Object.values(pages)[0]?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}
