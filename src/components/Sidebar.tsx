"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { personName, PersonId } from "@/lib/types";
import { TABS } from "@/lib/nav";

export default function Sidebar({
  me,
  onSwitch,
}: {
  me: PersonId;
  onSwitch: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.06)] md:flex">
      <div className="bg-gradient-to-br from-aegean-700 to-aegean-600 px-5 py-6">
        <p className="text-xl font-bold tracking-tight text-white">
          Crete Trip
        </p>
        <p className="mt-0.5 text-xs text-aegean-200">🇬🇷 Chania, Crete</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-aegean-50 text-aegean-700"
                      : "text-stone-500 hover:bg-stone-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      active
                        ? "bg-aegean-600 text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    <tab.icon className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-100 p-4">
        <button
          onClick={onSwitch}
          className="flex w-full items-center gap-2 rounded-2xl bg-stone-50 px-3 py-2 text-left text-xs font-medium text-stone-600 hover:bg-stone-100"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aegean-600 text-[11px] font-bold text-white">
            {personName(me)[0]}
          </span>
          {personName(me)} &middot; switch
        </button>
      </div>
    </aside>
  );
}
