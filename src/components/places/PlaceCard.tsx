"use client";

import { useState } from "react";
import { Camera, MapPin, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";
import { Place, PlaceComment, PlaceRating, personName } from "@/lib/types";
import StarRating from "./StarRating";

export default function PlaceCard({
  place,
  ratings,
  comments,
  autoSearchingPhoto,
}: {
  place: Place;
  ratings: PlaceRating[];
  comments: PlaceComment[];
  autoSearchingPhoto?: boolean;
}) {
  const { me } = useIdentity();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Tracks the specific URL that failed to load, so a *new* photo_url
  // (e.g. from the auto-photo sweep retrying) always gets a fresh chance.
  const [brokenPhotoUrl, setBrokenPhotoUrl] = useState<string | null>(null);
  const photoBroken = place.photo_url != null && place.photo_url === brokenPhotoUrl;

  async function handlePhoto(file: File) {
    setPhotoError(null);
    setUploadingPhoto(true);

    const path = `${place.id}-${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("place-photos")
      .upload(path, file);

    if (uploadErr) {
      setPhotoError(uploadErr.message);
      setUploadingPhoto(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("place-photos").getPublicUrl(path);

    const { error: dbError } = await supabase
      .from("places")
      .update({ photo_url: publicUrl })
      .eq("id", place.id);

    setUploadingPhoto(false);
    if (dbError) setPhotoError(dbError.message);
  }

  async function removePhoto() {
    await supabase.from("places").update({ photo_url: null }).eq("id", place.id);
  }

  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
  const myRating = ratings.find((r) => r.person_id === me)?.rating ?? 0;

  async function rate(value: number) {
    if (!me) return;
    await supabase
      .from("place_ratings")
      .upsert(
        { place_id: place.id, person_id: me, rating: value },
        { onConflict: "place_id,person_id" },
      );
  }

  async function toggleVisited() {
    await supabase
      .from("places")
      .update({ visited: !place.visited })
      .eq("id", place.id);
  }

  async function deletePlace() {
    if (!window.confirm(`Remove "${place.name}"?`)) return;
    await supabase.from("places").delete().eq("id", place.id);
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !me) return;
    await supabase.from("place_comments").insert({
      place_id: place.id,
      person_id: me,
      comment: commentText.trim(),
    });
    setCommentText("");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-aegean-100 bg-white shadow-sm">
      {place.photo_url && !photoBroken ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo from Supabase Storage, not a static asset */}
          <img
            src={place.photo_url}
            alt={place.name}
            className="h-40 w-full object-cover"
            onError={() => {
              setBrokenPhotoUrl(place.photo_url);
              removePhoto();
            }}
          />
          <button
            onClick={removePhoto}
            aria-label="Remove photo"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : autoSearchingPhoto ? (
        <div className="flex h-16 w-full items-center justify-center gap-2 border-b border-dashed border-stone-200 bg-stone-50 text-xs font-medium text-stone-400">
          <Camera className="h-4 w-4 animate-pulse" />
          Finding a photo…
        </div>
      ) : (
        <label className="flex h-16 w-full cursor-pointer items-center justify-center gap-2 border-b border-dashed border-stone-200 bg-stone-50 text-xs font-medium text-aegean-700">
          <Camera className="h-4 w-4" />
          {uploadingPhoto ? "Uploading…" : "Add photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingPhoto}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handlePhoto(file);
            }}
          />
        </label>
      )}
      {photoError && (
        <p className="px-4 pt-2 text-xs text-red-600">{photoError}</p>
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
          <button
            onClick={toggleVisited}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              place.visited
                ? "bg-emerald-100 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {place.visited ? "Visited" : "Not visited"}
          </button>
        </div>

        {place.notes && (
          <p className="mt-1 text-sm text-stone-500">{place.notes}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating value={avg} />
            <span className="text-xs text-stone-400">
              {ratings.length > 0 ? avg.toFixed(1) : "no ratings"}
            </span>
          </div>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="text-xs font-medium text-aegean-700"
          >
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-stone-500">
          Your rating: <StarRating value={myRating} onChange={rate} />
        </div>

        {showComments && (
          <div className="mt-3 flex flex-col gap-2 border-t border-stone-100 pt-3">
            {comments.length === 0 ? (
              <p className="text-xs text-stone-400">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium text-stone-700">
                    {personName(c.person_id)}:
                  </span>{" "}
                  <span className="text-stone-600">{c.comment}</span>
                </div>
              ))
            )}
            <form onSubmit={addComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-aegean-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={deletePlace}
          className="mt-3 text-xs font-medium text-red-600"
        >
          Remove place
        </button>
      </div>
    </div>
  );
}
