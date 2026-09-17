"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import OfferNextSteps from "@/components/offer/offer-next-steps";

gsap.registerPlugin(useGSAP);

export default function OfferThankYouPage() {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bits = page.querySelectorAll("[data-thank-you]");
      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(bits, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" });
    },
    { scope: pageRef },
  );

  return (
    <main ref={pageRef} className="bg-neutral-100 py-16 sm:py-20 lg:py-24">
      <div className="container-site text-center">
        <h1
          data-thank-you
          className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
        >
          Thank you
        </h1>
        <p data-thank-you className="mx-auto mt-4 max-w-xl text-sm text-black/60 sm:text-base">
          We have your truck details and will follow up with an offer. You can list the same vehicle on the site while
          you wait.
        </p>
        <div data-thank-you>
          <OfferNextSteps />
        </div>
      </div>
    </main>
  );
}
