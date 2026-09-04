"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type PendingAction =
  | { type: "reveal"; listingId: string }
  | { type: "chat"; listingId: string }
  | { type: "favorite"; listingId: string }
  | { type: "sell" }
  | null;

type AuthDialogContextValue = {
  open: boolean;
  pending: PendingAction;
  requestAuth: (pending?: PendingAction) => void;
  close: () => void;
  consumePending: () => PendingAction;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const requestAuth = useCallback((next?: PendingAction) => {
    setPending(next ?? null);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const consumePending = useCallback(() => {
    const current = pending;
    setPending(null);
    return current;
  }, [pending]);

  const value = useMemo(
    () => ({ open, pending, requestAuth, close, consumePending }),
    [open, pending, requestAuth, close, consumePending],
  );

  return <AuthDialogContext.Provider value={value}>{children}</AuthDialogContext.Provider>;
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog must be used within AuthDialogProvider");
  return ctx;
}
