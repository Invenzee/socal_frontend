"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "@/providers/auth-provider";
import { hasRecentOffer } from "@/lib/guest";
import OfferForm from "@/components/offer/offer-form";
import OfferNextSteps from "@/components/offer/offer-next-steps";

gsap.registerPlugin(useGSAP);

export default function GetAnOfferPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const pageRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(hasRecentOffer());
  }, []);

  useEffect(() => {
    if (!loading && user) router.replace("/sell");
  }, [loading, router, user]);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bits = page.querySelectorAll("[data-offer-page]");
      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(bits, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
    },
    { scope: pageRef },
  );

  if (loading || user) {
    return <main className="container-site py-20 text-sm text-black/55">Loading...</main>;
  }

  return (
    <main ref={pageRef} className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            data-offer-page
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            Get an Offer
          </h1>
          <p data-offer-page className="mt-4 text-sm text-black/60 sm:text-base">
            {submitted
              ? "We already have your request. We will be in touch with a price."
              : "A few details about your truck is all we need. No account required."}
          </p>
        </div>
        <div data-offer-page className="mx-auto mt-8 max-w-4xl rounded-2xl bg-brand p-5 shadow-[0_16px_0_0_var(--color-brand-red)] sm:mt-10 sm:p-8">
          {submitted ? (
            <div className="rounded-xl bg-white px-4 py-6">
              <OfferNextSteps />
            </div>
          ) : (
            <OfferForm tone="brand" />
          )}
        </div>
      </div>
    </main>
  );
}
