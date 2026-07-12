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
    <aside className="hidden w-56 shrink-0 flex-col border-r border-aegean-100 bg-white md:flex">
      <div className="border-b border-aegean-100 px-5 py-5">
        <p className="text-lg font-bold text-aegean-700">Crete Trip 🇬🇷</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active
                      ? "bg-aegean-50 text-aegean-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg leading-none">{tab.icon}</span>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-aegean-100 p-4">
        <button
          onClick={onSwitch}
          className="w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
        >
          {personName(me)} &middot; switch
        </button>
      </div>
    </aside>
  );
}
