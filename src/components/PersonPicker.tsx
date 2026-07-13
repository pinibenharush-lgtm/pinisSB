"use client";

import { useIdentity } from "@/lib/identity";
import { PEOPLE } from "@/lib/types";

export default function PersonPicker() {
  const { setMe } = useIdentity();

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-gradient-to-br from-aegean-700 to-aegean-600 px-6 pb-10 pt-16 text-center">
        <p className="font-display text-3xl font-semibold tracking-tight text-white">
          Crete Trip
        </p>
        <p className="mt-1 text-sm text-aegean-200">🇬🇷 Chania, Crete</p>
      </div>
      <div className="meander-rule" />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <p className="text-stone-500">Who&apos;s using the app?</p>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              onClick={() => setMe(p.id)}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm transition active:scale-[0.98] active:bg-aegean-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aegean-600 text-lg font-bold text-white">
                {p.name[0]}
              </span>
              <span className="text-lg font-semibold text-stone-800">
                {p.name}
              </span>
            </button>
          ))}
        </div>
        <p className="max-w-xs text-xs text-stone-400">
          This just tells the app who you are on this device &mdash; no
          password needed. You can change it later from the menu.
        </p>
      </div>
    </div>
  );
}
