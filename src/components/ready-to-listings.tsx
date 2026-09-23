"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ReadyToListings() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLAnchorElement>(null);
  const browseRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const contact = contactRef.current;
      const browse = browseRef.current;
      if (!section || !content || !contact || !browse) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const items = content.querySelectorAll("[data-ready-item]");
      const ctas = [contact, browse];

      if (reduced) {
        gsap.set([items, ...ctas], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(items, { autoAlpha: 0, y: 24 });
      gsap.set(ctas, { autoAlpha: 0, y: 20 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      intro.to(items, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
      });
      intro.to(ctas, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.25);

      const cleanups: Array<() => void> = [];
      ctas.forEach((cta) => {
        const enter = () =>
          gsap.to(cta, {
            scale: 1.05,
            filter: "brightness(1.1)",
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(cta, {
            scale: 1,
            filter: "brightness(1)",
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto",
          });
        cta.addEventListener("mouseenter", enter);
        cta.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          cta.removeEventListener("mouseenter", enter);
          cta.removeEventListener("mouseleave", leave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="bg-neutral-100 py-16 sm:py-20 lg:py-24"
    >
      <div
        ref={contentRef}
        className="container-site flex flex-col items-center text-center"
      >
        <h2
          data-ready-item
          className="max-w-3xl font-heading uppercase leading-[1.15] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
        >
          Ready to Buy or Sell
          <span className="block">a Truck Today?</span>
        </h2>
        <p
          data-ready-item
          className="mt-5 max-w-2xl text-sm leading-relaxed text-black/65 sm:mt-6 sm:text-base"
        >
          Join SoCalTruckTrade and connect with truck buyers and sellers across
          Southern California. Have a question first? Our team is happy to help.
        </p>
        <div
          data-ready-item
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
        >
          <Link
            ref={contactRef}
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-semibold text-white sm:px-8 sm:text-base"
          >
            Contact Us
          </Link>
          <Link
            ref={browseRef}
            href="/listings"
            className="inline-flex items-center justify-center rounded-lg border-2 border-brand bg-white px-7 py-3 text-sm font-semibold text-brand sm:px-8 sm:text-base"
          >
            Browse Listings
          </Link>
        </div>
        <p
          data-ready-item
          className="mt-10 max-w-3xl text-xs leading-relaxed text-black/55 sm:mt-12 sm:text-sm"
        >
          SoCalTruckTrade is a truck-only marketplace based in Anaheim,
          California. Buy or sell semis, box trucks and pickups, and connect
          directly with buyers and sellers across California and nearby states.
        </p>
      </div>
    </section>
  );
}
