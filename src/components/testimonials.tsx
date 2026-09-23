"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TESTIMONIALS = [
  {
    quote:
      "I posted my Peterbilt on Monday and had three serious messages by Wednesday. Selling directly to buyers saved me a lot of hassle.",
    name: "Marcus T.",
    location: "Bakersfield, CA",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "Finding a used Ford F-250 near me was easy. I could filter by price and mileage, then message the owner right away.",
    name: "Daniel R.",
    location: "Riverside, CA",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    quote:
      "The offer form was quick, and the follow-up call came the same afternoon. No pressure, no confusing steps.",
    name: "Lisa M.",
    location: "Anaheim, CA",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "We needed two box trucks for our delivery business. Being able to compare listings in one place saved us days.",
    name: "Carlos V.",
    location: "Las Vegas, NV",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    quote:
      "Clear listings, honest sellers, and a simple process. I'd use it again for my next truck.",
    name: "Tyler B.",
    location: "Phoenix, AZ",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    quote:
      "I'd been trying to sell my old Kenworth for weeks elsewhere. Here I had a buyer in under a week.",
    name: "Robert H.",
    location: "San Diego, CA",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
  },
] as const;

const PAGE_COUNT = 3;

function getVisibleCount() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3;
  if (window.matchMedia("(min-width: 640px)").matches) return 2;
  return 1;
}

function getPeekCount() {
  if (window.matchMedia("(min-width: 1024px)").matches) return 3.2;
  if (window.matchMedia("(min-width: 640px)").matches) return 2.2;
  return 1.1;
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const [page, setPage] = useState(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const header = headerRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!section || !header || !viewport || !track) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const layoutAndGo = (nextPage: number, animate: boolean) => {
        const cards =
          track.querySelectorAll<HTMLElement>("[data-testimonial-card]");
        const peek = getPeekCount();
        const visible = getVisibleCount();
        const gap = window.matchMedia("(min-width: 640px)").matches ? 24 : 16;
        const slot =
          (viewport.clientWidth - gap * Math.floor(peek)) / peek;

        cards.forEach((card) => {
          card.style.width = `${slot}px`;
        });

        const maxIndex = Math.max(TESTIMONIALS.length - visible, 0);
        const step =
          PAGE_COUNT > 1 ? Math.ceil(maxIndex / (PAGE_COUNT - 1)) : 0;
        const index = Math.min(nextPage * step, maxIndex);
        const x = -(index * (slot + gap));

        if (!animate || reduced) {
          gsap.set(track, { x });
          return;
        }

        gsap.to(track, {
          x,
          duration: 0.55,
          ease: "power3.out",
          overwrite: "auto",
        });
      };

      layoutAndGo(pageRef.current, false);

      const onPageClick = (event: Event) => {
        const target = event.currentTarget as HTMLButtonElement;
        const nextPage = Number(target.dataset.page);
        if (Number.isNaN(nextPage)) return;
        pageRef.current = nextPage;
        setPage(nextPage);
        layoutAndGo(nextPage, true);
      };

      const buttons =
        section.querySelectorAll<HTMLButtonElement>("[data-page]");
      buttons.forEach((btn) => btn.addEventListener("click", onPageClick));

      if (reduced) {
        gsap.set([header, viewport], { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(header, { autoAlpha: 0, y: 28 });
        gsap.set(viewport, { autoAlpha: 0, y: 36 });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        intro.to(header, { autoAlpha: 1, y: 0, duration: 0.7 });
        intro.to(viewport, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15);
      }

      const onResize = () => layoutAndGo(pageRef.current, false);
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        buttons.forEach((btn) =>
          btn.removeEventListener("click", onPageClick)
        );
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden bg-brand-red py-16 sm:py-20 lg:py-24"
    >
      <div className="container-site">
        <div
          ref={headerRef}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-16"
        >
          <h2 className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-white text-[clamp(1.75rem,6vw,50px)]">
            What Buyers and Sellers Say
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/95 sm:text-base lg:pt-2">
            Real people, real trucks, and deals that got done. Here&apos;s what
            our community has to say about buying and selling on SoCalTruckTrade.
          </p>
        </div>
      </div>

      <div className="mt-10 flex w-full overflow-hidden sm:mt-12 lg:mt-14">
        <div
          className="w-[max(1rem,calc((100vw-1140px)/2))] shrink-0"
          aria-hidden
        />
        <div ref={viewportRef} className="min-w-0 flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="flex w-full gap-4 will-change-transform sm:gap-6"
          >
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                data-testimonial-card
                className="flex w-full shrink-0 flex-col justify-between rounded-[20px] bg-white p-6 sm:rounded-[24px] sm:p-8"
              >
                <p className="text-sm leading-relaxed text-black/85 sm:text-[15px]">
                  {item.quote}
                </p>
                <div className="mt-8 flex items-center gap-3 sm:mt-10">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-neutral-200 sm:size-12">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-black sm:text-base">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-black/55 sm:text-sm">
                      {item.location}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2.5 sm:mt-12">
        {Array.from({ length: PAGE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            data-page={i}
            aria-label={`Go to testimonials page ${i + 1}`}
            aria-current={page === i ? "true" : undefined}
            className={
              page === i
                ? "h-2.5 w-10 rounded-full bg-white transition-all duration-300"
                : "size-2.5 rounded-full bg-black/80 transition-all duration-300 hover:bg-black"
            }
          />
        ))}
      </div>
    </section>
  );
}
