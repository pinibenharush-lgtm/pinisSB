"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-stone-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-aegean-600 text-white" : "text-stone-400"
                  }`}
                >
                  <tab.icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className={active ? "text-aegean-700" : "text-stone-400"}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
