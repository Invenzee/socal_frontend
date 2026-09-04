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
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const content = contentRef.current;
      const cta = ctaRef.current;
      if (!section || !content || !cta) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const items = content.querySelectorAll("[data-ready-item]");

      if (reduced) {
        gsap.set([items, cta], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(items, { autoAlpha: 0, y: 24 });
      gsap.set(cta, { autoAlpha: 0, y: 20 });

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
      intro.to(cta, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.25);

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

      return () => {
        cta.removeEventListener("mouseenter", enter);
        cta.removeEventListener("mouseleave", leave);
      };
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
          Are you ready to Listings with Truck Trade today!!
        </h2>
        <p
          data-ready-item
          className="mt-5 max-w-2xl text-sm leading-relaxed text-black/65 sm:mt-6 sm:text-base"
        >
          Lorem ipsum dolor sit amet consectetur. Aliquet dictum netus lacus
          interdum dignissim ante. Tempus scelerisque ut orci ultrices nec non.
          Euismod proin est nulla sed nec. In eu id tellus integer.
        </p>
        <Link
          ref={ctaRef}
          href="/contact"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-semibold text-white sm:mt-10 sm:px-8 sm:text-base"
        >
          Contact Us
        </Link>
      </div>
    </section>
  );
}
