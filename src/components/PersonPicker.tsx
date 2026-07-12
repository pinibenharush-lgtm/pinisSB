"use client";

import { useIdentity } from "@/lib/identity";
import { PEOPLE } from "@/lib/types";

export default function PersonPicker() {
  const { setMe } = useIdentity();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-aegean-700">Crete Trip 🇬🇷</h1>
        <p className="mt-1 text-slate-500">Who&apos;s using the app?</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        {PEOPLE.map((p) => (
          <button
            key={p.id}
            onClick={() => setMe(p.id)}
            className="w-full rounded-xl bg-aegean-600 px-6 py-4 text-lg font-semibold text-white shadow-sm active:scale-[0.98] transition"
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="max-w-xs text-xs text-slate-400">
        This just tells the app who you are on this device &mdash; no
        password needed. You can change it later from the menu.
      </p>
    </div>
  );
}
