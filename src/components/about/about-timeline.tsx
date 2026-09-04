"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MILESTONES = [
  {
    year: "2015",
    title: "Vroomo Beginnings",
    body: "Starting with a passion for providing reliable transportation solutions, we focused on giving every customer a smooth and personalized rental experience.",
    yearSide: "left" as const,
  },
  {
    year: "2018",
    title: "Expanding the Fleet and Services",
    body: "Three years later, we expanded our fleet and added new vehicle categories, from compact city cars to family-sized SUVs.",
    yearSide: "right" as const,
  },
  {
    year: "2022",
    title: "Embracing Technology",
    body: "In 2020, we took a major step forward by launching our mobile app and online booking system. Now, customers could browse vehicles, reserve a car, and check out in minutes, all from the comfort of their device.",
    yearSide: "left" as const,
  },
  {
    year: "2026",
    title: "Expanding Our Horizons",
    body: "This year, we reached another milestone by opening our newest branch and partnering with local businesses to offer unique travel experiences across Southern California.",
    yearSide: "right" as const,
  },
] as const;

export default function AboutTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const pin = pinRef.current;
      const heading = headingRef.current;
      const line = lineRef.current;
      if (!section || !pin || !heading || !line) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const panels = gsap.utils.toArray<HTMLElement>(
        pin.querySelectorAll("[data-milestone]")
      );
      const markers = gsap.utils.toArray<HTMLElement>(
        pin.querySelectorAll("[data-marker]")
      );

      if (reduced) {
        gsap.set(heading, { autoAlpha: 0, y: -40 });
        gsap.set(line, { scaleY: 1 });
        gsap.set(panels, { autoAlpha: 0, y: 0 });
        gsap.set(panels[0], { autoAlpha: 1 });
        gsap.set(markers, { autoAlpha: 0.35, scale: 0.6 });
        gsap.set(markers[0], { autoAlpha: 1, scale: 1 });
        return;
      }

      gsap.set(heading, { autoAlpha: 1, y: 0 });
      gsap.set(line, { scaleY: 0, transformOrigin: "center center" });
      gsap.set(panels, { autoAlpha: 0, y: 40 });
      gsap.set(markers, { scale: 0.6, autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${(panels.length + 1) * 100}%`,
          pin: pin,
          scrub: 0.65,
          anticipatePin: 1,
        },
      });

      // Hold on title, then title goes up while the line draws in
      tl.to({}, { duration: 0.4 });
      tl.to(
        heading,
        {
          autoAlpha: 0,
          y: -140,
          duration: 0.5,
        },
        ">"
      );
      tl.to(
        line,
        {
          scaleY: 1,
          duration: 0.5,
        },
        "<"
      );

      panels.forEach((panel, i) => {
        const marker = markers[i];
        const isLast = i === panels.length - 1;

        tl.to(
          panel,
          { autoAlpha: 1, y: 0, duration: 0.4 },
          i === 0 ? "<0.2" : ">"
        );
        if (marker) {
          tl.to(marker, { scale: 1, autoAlpha: 1, duration: 0.3 }, "<");
        }

        tl.to({}, { duration: 0.5 });

        if (!isLast) {
          tl.to(panel, { autoAlpha: 0, y: -36, duration: 0.35 });
          if (marker) {
            tl.to(
              marker,
              { scale: 0.6, autoAlpha: 0.35, duration: 0.25 },
              "<"
            );
          }
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-100"
    >
      <div ref={pinRef} className="relative flex min-h-[100svh] flex-col">
        {/* Line grows top↔bottom when title exits */}
        <div
          ref={lineRef}
          className="pointer-events-none absolute left-4 top-0 z-10 h-full w-px bg-brand-red sm:left-1/2 sm:-translate-x-1/2"
          aria-hidden
        />

        <div className="pointer-events-none absolute left-[5%] top-1/3 z-0 hidden size-28 -translate-y-1/2 -rotate-45 overflow-hidden border-[6px] border-brand bg-neutral-200 lg:block xl:size-36">
          <div className="relative flex size-full rotate-45 items-center justify-center overflow-hidden">
            <Image
              src="/time-line-1.webp"
              alt=""
              width={140}
              height={140}
              className="size-[120%] max-w-none object-cover"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[12%] right-[8%] z-0 hidden h-28 w-44 overflow-hidden bg-neutral-200 lg:block xl:h-36 xl:w-56">
          <Image
            src="/timeline-2.webp"
            alt=""
            width={224}
            height={144}
            className="size-full object-cover"
          />
        </div>

        <div className="container-site relative z-20 flex min-h-[100svh] flex-col">
          <div className="absolute inset-x-0 top-0 flex min-h-[100svh] items-center justify-center px-4">
            <h2
              ref={headingRef}
              className="mx-auto max-w-4xl text-center font-heading uppercase leading-[1.12] tracking-[0.04em] text-black text-[clamp(1.5rem,5vw,42px)]"
            >
              The Evolution of Our Selling Journey History
            </h2>
          </div>

          <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center py-10 sm:py-12">
            <div className="relative w-full min-h-[280px] sm:min-h-[320px]">
              {MILESTONES.map((item) => {
                const yearLeft = item.yearSide === "left";

                return (
                  <div
                    key={item.year}
                    data-milestone
                    className="absolute inset-x-0 top-1/2 flex w-full -translate-y-1/2 items-center"
                  >
                    <div
                      data-marker
                      className="absolute left-4 top-1/2 z-20 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-brand-red sm:left-1/2 sm:size-6"
                      aria-hidden
                    >
                      <span className="size-2 rounded-full bg-white" />
                    </div>

                    <div className="grid w-full grid-cols-1 gap-6 pl-12 sm:grid-cols-2 sm:gap-16 sm:pl-0">
                      <div
                        className={
                          yearLeft
                            ? "sm:pr-10 sm:text-right"
                            : "sm:order-2 sm:pl-10 sm:text-left"
                        }
                      >
                        <p className="font-heading text-[clamp(2.5rem,8vw,4.5rem)] leading-none tracking-[0.04em] text-brand">
                          {item.year}
                        </p>
                      </div>

                      <div
                        className={
                          yearLeft
                            ? "sm:pl-10 sm:text-left"
                            : "sm:order-1 sm:pr-10 sm:text-right"
                        }
                      >
                        <h3 className="text-lg font-semibold text-black sm:text-xl">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-black/70 sm:text-base">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
