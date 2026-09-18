"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/api";
import type { UserAccount } from "@/types";

const CurrentUserContext = createContext<UserAccount | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((account) => {
        if (!cancelled) setUser(account);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): UserAccount | null {
  return useContext(CurrentUserContext);
}
