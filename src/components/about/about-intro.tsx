"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const copy = copyRef.current;
      const media = mediaRef.current;
      const cta = ctaRef.current;
      if (!section || !copy || !media || !cta) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set([copy, media], { autoAlpha: 1, x: 0, y: 0 });
        return;
      }

      gsap.set(copy, { autoAlpha: 0, x: -28 });
      gsap.set(media, { autoAlpha: 0, x: 28 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      intro.to(copy, { autoAlpha: 1, x: 0, duration: 0.75 });
      intro.to(media, { autoAlpha: 1, x: 0, duration: 0.75 }, 0.12);

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
      <div className="container-site grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div ref={copyRef} className="max-w-xl">
          <h2 className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]">
            All About SoCal Trucks
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-black/70 sm:mt-6 sm:text-base">
            At SoCalTruckTrade, our streamlined process of buying inventory is
            geared towards customer satisfaction. More often, trucks are
            undervalued by most car buying companies due to lack of specific
            knowledge. Our vast experience in commercial inventory and trucks
            allows us to give customers what they want. Based in Anaheim,
            California, we are able to cater to customers in all of California
            and neighboring states.
          </p>
          <Link
            ref={ctaRef}
            href="/listings"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand-red px-7 py-3 text-sm font-semibold text-white sm:mt-10 sm:px-8 sm:text-base"
          >
            Get Started
          </Link>
        </div>

        <div ref={mediaRef} className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            className="absolute -left-3 -top-3 z-0 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] border-l-[10px] border-t-[10px] border-brand-red sm:-left-4 sm:-top-4 sm:border-l-[12px] sm:border-t-[12px]"
            aria-hidden
          />
          <div className="relative z-10 aspect-[4/3] w-full overflow-hidden bg-neutral-200">
            <Image
              src="/about-about-sec-image.webp"
              alt="Pickup trucks on a mountain overlook"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
