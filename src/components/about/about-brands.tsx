"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const BRANDS = [
  { name: "Ford", src: "/ford-icon.webp" },
  { name: "BMW", src: "/bmw-icon.webp" },
  { name: "Chevrolet", src: "/chevrolet-icon.webp" },
  { name: "Audi", src: "/audi-icon.webp" },
  { name: "Mercedes-Benz", src: "/mercedes-icon.webp" },
  { name: "Toyota", src: "/toyota-icon.webp" },
  { name: "Nissan", src: "/nissan-icon.webp" },
  { name: "Ram", src: "/ram-icon.webp" },
  { name: "GMC", src: "/Group.webp" },
] as const;

export default function AboutBrands() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !viewport || !track) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const items = track.querySelectorAll<HTMLElement>("[data-about-brand]");

      const sizeItems = () => {
        const visible = window.matchMedia("(min-width: 1024px)").matches
          ? 6
          : window.matchMedia("(min-width: 640px)").matches
            ? 4
            : 2;
        const slot = viewport.clientWidth / visible;
        items.forEach((item) => {
          item.style.width = `${slot}px`;
        });
      };

      sizeItems();

      if (reduced) {
        gsap.set(viewport, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(viewport, { autoAlpha: 0, y: 16 });
      gsap.to(viewport, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });

      let loop: gsap.core.Tween | undefined;

      const startLoop = () => {
        loop?.kill();
        gsap.set(track, { x: 0 });
        sizeItems();
        const half = track.scrollWidth / 2;
        if (half <= 0) return;
        loop = gsap.to(track, {
          x: -half,
          duration: Math.max(half / 40, 18),
          ease: "none",
          repeat: -1,
        });
      };

      startLoop();

      const onResize = () => startLoop();
      window.addEventListener("resize", onResize);

      const pause = () => loop?.pause();
      const play = () => loop?.resume();
      viewport.addEventListener("mouseenter", pause);
      viewport.addEventListener("mouseleave", play);

      return () => {
        window.removeEventListener("resize", onResize);
        viewport.removeEventListener("mouseenter", pause);
        viewport.removeEventListener("mouseleave", play);
        loop?.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden bg-neutral-100 py-10 sm:py-12 lg:py-14"
    >
      <div ref={viewportRef} className="w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max will-change-transform"
          aria-label="Popular truck brands"
        >
          {[...BRANDS, ...BRANDS].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              data-about-brand
              className="flex shrink-0 items-center justify-center px-4 sm:px-6"
            >
              <div className="group flex h-12 w-full max-w-[140px] items-center justify-center sm:h-14">
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={140}
                  height={56}
                  className="h-9 max-w-full object-contain grayscale transition-[filter,transform] duration-300 ease-out group-hover:scale-105 group-hover:grayscale-0 sm:h-11"
                  style={{ width: "auto" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
