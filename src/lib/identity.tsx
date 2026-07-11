"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PersonId } from "./types";

const STORAGE_KEY = "crete-trip-whoami";

type IdentityContextValue = {
  me: PersonId | null;
  setMe: (id: PersonId) => void;
  clearMe: () => void;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [me, setMeState] = useState<PersonId | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pini" || stored === "sean" || stored === "ori") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMeState(stored);
    }
    setLoaded(true);
  }, []);

  function setMe(id: PersonId) {
    window.localStorage.setItem(STORAGE_KEY, id);
    setMeState(id);
  }

  function clearMe() {
    window.localStorage.removeItem(STORAGE_KEY);
    setMeState(null);
  }

  if (!loaded) return null;

  return (
    <IdentityContext.Provider value={{ me, setMe, clearMe }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider");
  return ctx;
}
