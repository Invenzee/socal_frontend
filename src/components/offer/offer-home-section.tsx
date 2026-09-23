"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/providers/auth-provider";
import { hasRecentOffer } from "@/lib/guest";
import OfferForm from "@/components/offer/offer-form";
import OfferNextSteps from "@/components/offer/offer-next-steps";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function OfferHomeSection() {
  const { user, loading } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSubmitted(hasRecentOffer());
    setReady(true);
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bits = section.querySelectorAll("[data-offer-reveal]");
      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.set(bits, { autoAlpha: 0, y: 28 });
      gsap.to(bits, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [user, submitted, loading, ready] },
  );

  if (loading || !ready) return null;

  if (user?.role === "seller" || user?.role === "admin") return null;

  if (user?.role === "buyer") {
    return (
      <section ref={sectionRef} className="bg-brand/8 py-16 sm:py-20 lg:py-24">
        <div className="container-site text-center">
          <h2
            data-offer-reveal
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            Get an Offer
          </h2>
          <p data-offer-reveal className="mx-auto mt-4 max-w-xl text-sm text-black/60 sm:text-base">
            You already have an account. List your truck on the site to reach buyers.
          </p>
          <div data-offer-reveal>
            <Link
              href="/sell"
              className="mt-8 inline-flex items-center justify-center rounded-[8px] bg-brand px-8 py-3 text-sm font-semibold text-white sm:text-base"
            >
              List your vehicle
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="bg-brand/8 py-16 sm:py-20 lg:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-xl text-center">
          <h2
            data-offer-reveal
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            Get an Offer on Your Truck
          </h2>
          <p data-offer-reveal className="mt-4 text-sm text-black/60 sm:text-base">
            {submitted
              ? "We already have your request. We will be in touch with a price."
              : "Tell us a few details about your truck. It takes about two minutes, and no account is needed."}
          </p>
        </div>
        <div data-offer-reveal className="mx-auto mt-8 max-w-4xl rounded-2xl bg-brand p-5 shadow-[0_16px_0_0_var(--color-brand-red)] sm:mt-10 sm:p-8">
          {submitted ? (
            <div className="rounded-xl bg-white px-4 py-6">
              <OfferNextSteps />
            </div>
          ) : (
            <OfferForm tone="brand" />
          )}
          {submitted ? null : (
            <p className="mt-4 text-center text-sm text-white/75">
              Prefer more room?{" "}
              <Link href="/get-an-offer" className="font-semibold text-white underline underline-offset-4 hover:text-white">
                Open the full page
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
