"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REASONS = [
  {
    step: "01",
    title: "Trucks only",
    body: "Shop and list semis, box trucks, medium-duty trucks, and pickups in one marketplace.",
    stepSide: "left" as const,
  },
  {
    step: "02",
    title: "Buy from the owner",
    body: "Search listings, compare price and mileage, and message the seller directly. There is no middleman in the deal.",
    stepSide: "right" as const,
  },
  {
    step: "03",
    title: "Sell your way",
    body: "Post a free listing and talk with buyers, or tell us about the truck and ask for an offer.",
    stepSide: "left" as const,
  },
  {
    step: "04",
    title: "Close to the truck",
    body: "We are based in Anaheim and connect buyers and sellers across California, Nevada, Arizona, and Oregon.",
    stepSide: "right" as const,
  },
] as const;

export default function WhyChoose() {
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
        gsap.set(heading, { autoAlpha: 1, y: 0 });
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
      aria-labelledby="why-choose-heading"
    >
      <div ref={pinRef} className="relative flex min-h-[100svh] flex-col">
        <div
          ref={lineRef}
          className="pointer-events-none absolute left-4 top-0 z-10 h-full w-px bg-brand-red sm:left-1/2 sm:-translate-x-1/2"
          aria-hidden
        />

        <div className="pointer-events-none absolute left-[4%] top-[30%] z-0 hidden size-36 -translate-y-1/2 -rotate-45 overflow-hidden border-[6px] border-brand bg-neutral-200 lg:block xl:size-44">
          <div className="relative flex size-full items-center justify-center overflow-hidden">
            <Image
              src="/timeline-gmc-sierra.webp"
              alt=""
              width={176}
              height={176}
              className="size-[165%] max-w-none origin-center -rotate-[-45deg] object-cover"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[10%] right-[6%] z-0 hidden h-36 w-56 overflow-hidden bg-neutral-200 lg:block xl:h-44 xl:w-72">
          <Image
            src="/timeline-toyota-tacoma.avif"
            alt=""
            width={288}
            height={176}
            className="size-full object-cover object-center"
          />
        </div>

        <div className="container-site relative z-20 flex min-h-[100svh] flex-col">
          <div className="absolute inset-x-0 top-0 flex min-h-[100svh] items-center justify-center px-4">
            <h2
              id="why-choose-heading"
              ref={headingRef}
              className="mx-auto max-w-4xl text-center font-heading uppercase leading-[1.12] tracking-[0.04em] text-black text-[clamp(1.5rem,5vw,42px)]"
            >
              Why Choose SoCal Truck Trade?
            </h2>
          </div>

          <div className="relative mx-auto flex w-full max-w-5xl flex-1 items-center py-10 sm:py-12">
            <div className="relative w-full min-h-[280px] sm:min-h-[320px]">
              {REASONS.map((item) => {
                const stepLeft = item.stepSide === "left";

                return (
                  <div
                    key={item.step}
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
                          stepLeft
                            ? "sm:pr-10 sm:text-right"
                            : "sm:order-2 sm:pl-10 sm:text-left"
                        }
                      >
                        <p className="font-heading text-[clamp(2.5rem,8vw,4.5rem)] leading-none tracking-[0.04em] text-brand">
                          {item.step}
                        </p>
                      </div>

                      <div
                        className={
                          stepLeft
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
