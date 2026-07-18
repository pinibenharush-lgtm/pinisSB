"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TwoCatsView from "@/components/game/TwoCatsView";
import TutView from "@/components/game/TutView";

type GameKey = "two_cats" | "tut";

function GamePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial: GameKey = searchParams.get("g") === "tut" ? "tut" : "two_cats";
  const [active, setActive] = useState<GameKey>(initial);

  function selectGame(key: GameKey) {
    setActive(key);
    router.replace(key === "tut" ? "/game?g=tut" : "/game", { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader eyebrow="Today's puzzle" title="🎲 Games" />

      <div className="flex gap-1 rounded-full bg-stone-100 p-1">
        <button
          onClick={() => selectGame("two_cats")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
            active === "two_cats"
              ? "bg-white text-aegean-700 shadow-sm"
              : "text-stone-500"
          }`}
        >
          🐱 Two Cats
        </button>
        <button
          onClick={() => selectGame("tut")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
            active === "tut"
              ? "bg-white text-aegean-700 shadow-sm"
              : "text-stone-500"
          }`}
        >
          🍓 Tut
        </button>
      </div>

      {active === "two_cats" ? <TwoCatsView /> : <TutView />}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={null}>
      <GamePageInner />
    </Suspense>
  );
}
