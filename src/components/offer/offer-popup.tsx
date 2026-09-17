"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiCloseLine, RiTruckLine } from "react-icons/ri";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { useOfferDialog } from "@/providers/offer-dialog-provider";
import { getGuestId, hasRecentOffer } from "@/lib/guest";
import OfferForm from "@/components/offer/offer-form";

gsap.registerPlugin(useGSAP);

const SKIP_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/dashboard"];
const SKIP_EXACT = ["/get-an-offer", "/get-an-offer/thank-you", "/sell"];

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
        gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: 20, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.38, ease: "power2.out" },
      );
    },
    { dependencies: [open] },
  );

  if (user || blockedPath) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? close() : undefined)}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55 supports-backdrop-filter:backdrop-blur-sm"
        className="max-h-[90vh] w-full max-w-[calc(100%-2rem)] overflow-hidden border-0 bg-transparent p-0 shadow-[0_24px_80px_rgba(1,75,173,0.35)] ring-0 sm:max-w-2xl sm:rounded-2xl"
      >
        <div ref={panelRef} className="overflow-hidden rounded-xl bg-white sm:rounded-2xl">
          <DialogHeader className="relative overflow-hidden bg-brand px-5 py-5 text-white sm:px-7 sm:py-6">
            <span aria-hidden className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-brand-red/35 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-8 size-48 rounded-full bg-white/15 blur-3xl" />
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <RiCloseLine className="size-5" />
            </button>
            <p className="relative inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-red px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-white uppercase">
              <RiTruckLine className="size-3.5" />
              Fast cash offer
            </p>
            <DialogTitle className="relative mt-3 font-heading text-[clamp(1.6rem,4vw,2.15rem)] uppercase leading-tight tracking-[0.04em] text-white">
              Get an offer
            </DialogTitle>
            <DialogDescription className="relative mt-1.5 text-sm text-white/80">
              A few details about your truck is all we need. No account required.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(60vh,520px)] overflow-y-auto bg-brand/8 px-5 py-5 sm:px-7 sm:py-6">
            <OfferForm compact tone="brand" onSuccess={close} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
