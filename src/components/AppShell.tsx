"use client";

import { useIdentity } from "@/lib/identity";
import { personName } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import PersonPicker from "./PersonPicker";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { me, clearMe } = useIdentity();

  if (!me) {
    return <PersonPicker />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar me={me} onSwitch={clearMe} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-aegean-700 to-aegean-600 px-4 py-3 shadow-sm md:hidden">
          <p className="font-display text-base font-semibold tracking-tight text-white">
            Crete Trip 🇬🇷
          </p>
          <button
            onClick={clearMe}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white active:bg-white/25"
          >
            {personName(me)} &middot; switch
          </button>
        </header>

        {!isSupabaseConfigured && (
          <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-800">
            Supabase isn&apos;t configured yet &mdash; data won&apos;t be
            saved. See README.md for setup steps.
          </div>
        )}

        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-6 pt-4 md:max-w-2xl md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
