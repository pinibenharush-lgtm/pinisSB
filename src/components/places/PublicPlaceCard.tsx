import { MapPin } from "lucide-react";
import { Place, PlaceComment, PlaceRating, personName } from "@/lib/types";
import StarRating from "./StarRating";

export default function PublicPlaceCard({
  place,
  ratings,
  comments,
}: {
  place: Place;
  ratings: PlaceRating[];
  comments: PlaceComment[];
}) {
  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-aegean-100 bg-white shadow-sm">
      {place.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from Supabase Storage, not a static asset
        <img
          src={place.photo_url}
          alt={place.name}
          className="max-h-80 w-full bg-stone-100 object-contain"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aegean-50 text-aegean-700">
              <MapPin className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-stone-800">{place.name}</p>
              {place.link && (
                <a
                  href={place.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-aegean-700 underline"
                >
                  Open link
                </a>
              )}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              place.visited
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {place.visited ? "Visited" : "Not visited"}
          </span>
        </div>

        {place.notes && (
          <p className="mt-1 text-sm text-stone-500">{place.notes}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <StarRating value={avg} />
          <span className="text-xs text-stone-400">
            {ratings.length > 0 ? avg.toFixed(1) : "no ratings"}
          </span>
        </div>

        {comments.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5 border-t border-stone-100 pt-3">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium text-stone-700">
                  {personName(c.person_id)}:
                </span>{" "}
                <span className="text-stone-600">{c.comment}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
