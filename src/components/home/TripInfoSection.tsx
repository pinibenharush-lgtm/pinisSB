"use client";

import { useState } from "react";
import { Info, Paperclip, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useIdentity } from "@/lib/identity";
import { useRealtimeTable } from "@/lib/useRealtimeTable";
import { TripInfo } from "@/lib/types";
import EmptyState from "@/components/EmptyState";

export default function TripInfoSection() {
  const { me } = useIdentity();
  const { rows: items, loading } = useRealtimeTable<TripInfo>("trip_info", {
    column: "created_at",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [icon, setIcon] = useState("📌");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleAttach(itemId: string, file: File) {
    setUploadError(null);
    setUploadingId(itemId);

    // eslint-disable-next-line react-hooks/purity -- runs inside the file input's change handler, not during render
    const path = `${itemId}-${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("trip-files")
      .upload(path, file);

    if (uploadErr) {
      setUploadError(uploadErr.message);
      setUploadingId(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("trip-files").getPublicUrl(path);

    const { error: dbError } = await supabase
      .from("trip_info")
      .update({ file_url: publicUrl, file_name: file.name })
      .eq("id", itemId);

    setUploadingId(null);
    if (dbError) setUploadError(dbError.message);
  }

  async function handleRemoveAttachment(itemId: string) {
    await supabase
      .from("trip_info")
      .update({ file_url: null, file_name: null })
      .eq("id", itemId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !details.trim()) {
      setError("Add a title and some details");
      return;
    }

    setSaving(true);
    const { error: dbError } = await supabase.from("trip_info").insert({
      icon: icon.trim() || "📌",
      title: title.trim(),
      details: details.trim(),
      created_by: me,
    });
    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setIcon("📌");
    setTitle("");
    setDetails("");
    setFormOpen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this info card?")) return;
    await supabase.from("trip_info").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Trip info
        </p>
        <button
          onClick={() => setFormOpen((f) => !f)}
          className="text-xs font-medium text-aegean-700"
        >
          {formOpen ? "Cancel" : "+ Add info"}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm"
        >
          <div className="flex gap-2">
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📌"
              maxLength={4}
              className="w-14 rounded-lg border border-stone-300 px-2 py-2 text-center text-lg"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title, e.g. Car rental"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Details..."
            rows={3}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-aegean-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="py-4 text-center text-sm text-stone-400">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Info className="mx-auto h-6 w-6" />}
          message="No trip info yet."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-aegean-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aegean-50 text-xl leading-none">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-800">{item.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-stone-600">
                    {item.details}
                  </p>

                  {item.file_url ? (
                    <div className="mt-2 flex items-center gap-2">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-aegean-50 px-2 py-1 text-xs font-medium text-aegean-700"
                      >
                        <Paperclip className="h-3 w-3" />
                        {item.file_name ?? "View attachment"}
                      </a>
                      <button
                        onClick={() => handleRemoveAttachment(item.id)}
                        aria-label="Remove attachment"
                        className="text-stone-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-aegean-700">
                      <Paperclip className="h-3 w-3" />
                      {uploadingId === item.id ? "Uploading…" : "Attach file"}
                      <input
                        type="file"
                        className="hidden"
                        disabled={uploadingId === item.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) handleAttach(item.id, file);
                        }}
                      />
                    </label>
                  )}
                  {uploadingId === null && uploadError && (
                    <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="mt-2 text-xs font-medium text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
