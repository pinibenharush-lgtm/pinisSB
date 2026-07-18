import { supabase } from "./supabase";

/** Finds a Wikipedia page title matching the query, if any. */
async function searchPageTitle(query: string): Promise<string | null> {
  const res = await fetch(
    `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
      query,
    )}&limit=1`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data: { pages?: { key?: string; title?: string }[] } = await res.json();
  const page = data.pages?.[0];
  return page?.key ?? page?.title ?? null;
}

/** Gets the full-resolution lead image URL for a Wikipedia page, if any. */
async function pageOriginalImageUrl(title: string): Promise<string | null> {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data: {
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
  } = await res.json();
  return data.originalimage?.source ?? data.thumbnail?.source ?? null;
}

async function findWikipediaImageUrl(name: string): Promise<string | null> {
  for (const query of [`${name} Crete`, name]) {
    try {
      const title = await searchPageTitle(query);
      if (!title) continue;
      const imageUrl = await pageOriginalImageUrl(title);
      if (imageUrl) return imageUrl;
    } catch {
      // try the next query
    }
  }
  return null;
}

/**
 * Finds a representative photo for a place on Wikipedia and saves a copy of
 * it into our own Storage bucket, returning that URL — rather than hotlink
 * to Wikipedia indefinitely (fragile: URL formats and availability aren't
 * guaranteed to stay stable).
 */
export async function findPlacePhoto(name: string): Promise<string | null> {
  const imageUrl = await findWikipediaImageUrl(name);
  if (!imageUrl) return null;

  try {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) return null;
    const blob = await imageRes.blob();

    const ext = imageUrl.split(/[#?]/)[0].split(".").pop()?.toLowerCase() || "jpg";
    const path = `auto-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("place-photos")
      .upload(path, blob, { contentType: blob.type || `image/${ext}` });
    if (uploadError) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from("place-photos").getPublicUrl(path);
    return publicUrl;
  } catch {
    return null;
  }
}
