"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type OfferDialogContextValue = {
  open: boolean;
  requestOpen: () => void;
  close: () => void;
};

const OfferDialogContext = createContext<OfferDialogContextValue | null>(null);

export function OfferDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const requestOpen = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ open, requestOpen, close }), [open, requestOpen, close]);

  return <OfferDialogContext.Provider value={value}>{children}</OfferDialogContext.Provider>;
}

export function useOfferDialog() {
  const ctx = useContext(OfferDialogContext);
  if (!ctx) throw new Error("useOfferDialog must be used within OfferDialogProvider");
  return ctx;
}
