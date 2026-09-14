"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { useOfferDialog } from "@/providers/offer-dialog-provider";
import { getGuestId, hasRecentOffer } from "@/lib/guest";
import OfferForm from "@/components/offer/offer-form";

gsap.registerPlugin(useGSAP);

const SKIP_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/dashboard"];
const SKIP_EXACT = ["/get-an-offer", "/get-an-offer/thank-you"];

export default function OfferPopup() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { open, requestOpen, close } = useOfferDialog();
  const panelRef = useRef<HTMLDivElement>(null);

  const blockedPath =
    SKIP_EXACT.includes(pathname) || SKIP_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    getGuestId();
  }, []);

  useEffect(() => {
    if (blockedPath || user) close();
  }, [blockedPath, close, user]);

  useEffect(() => {
    if (loading || blockedPath || user || hasRecentOffer()) return;
    const timer = window.setTimeout(() => requestOpen(), 3000);
    return () => window.clearTimeout(timer);
  }, [blockedPath, loading, pathname, requestOpen, user]);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel || !open) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(panel, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" });
    },
    { dependencies: [open] },
  );

  if (user || blockedPath) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? close() : undefined)}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-y-auto border-black/10 bg-white sm:max-w-2xl sm:rounded-2xl"
        showCloseButton
      >
        <div ref={panelRef}>
          <DialogHeader>
            <DialogTitle className="font-heading text-[clamp(1.5rem,4vw,2rem)] uppercase tracking-[0.04em] text-black">
              Get an offer
            </DialogTitle>
            <DialogDescription className="text-sm text-black/60">
              A few details about your truck is all we need. No account required.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <OfferForm compact onSuccess={close} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
