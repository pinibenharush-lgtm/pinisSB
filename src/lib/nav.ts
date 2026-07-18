import { Home, Wallet, MapPin, ListChecks, Dices, Grid3x3 } from "lucide-react";

export const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/balance", label: "Balance", icon: Wallet },
  { href: "/places", label: "Places", icon: MapPin },
  { href: "/checklist", label: "Checklist", icon: ListChecks },
  { href: "/game", label: "Two Cats", icon: Dices },
  { href: "/tut", label: "Tut", icon: Grid3x3 },
];
