"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const header = headerRef.current;
      const image = imageRef.current;
      if (!section || !header || !image) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set([header, image], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(header, { autoAlpha: 0, y: 28 });
      gsap.set(image, { autoAlpha: 0, y: 36 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });

      intro.to(header, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(image, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.15);
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-neutral-100 pt-10 sm:pt-14 lg:pt-16">
      <div
        ref={headerRef}
        className="container-site grid grid-cols-1 gap-6 pb-10 sm:gap-8 sm:pb-12 lg:grid-cols-2 lg:items-start lg:gap-16 lg:pb-14"
      >
        <h1 className="font-heading uppercase leading-[1.08] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]">
          All About SoCal Trucks
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-black/70 sm:text-base lg:pt-2">
          At SoCalTruckTrade, our streamlined process of buying inventory is
          geared towards customer satisfaction.
        </p>
      </div>

      <div
        ref={imageRef}
        className="relative w-full h-full overflow-hidden bg-neutral-200"
      >
        <div className="relative w-full h-full">
          <img src="/about-hero.webp" alt="Pickup trucks overlooking mountains" className="object-contain w-full h-full relative" /> 
        </div>
      </div>
    </section>
  );
}
