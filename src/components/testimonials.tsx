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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Jaden Henderson",
    location: "Ash Dr. San Jose, South Dakota",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Annette Black",
    location: "Parker Rd. Allentown, New Mexico",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Courtney Henry",
    location: "Elgin St. Celina, Delaware",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Jenny Wilson",
    location: "Preston Rd. Inglewood, Maine",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Robert Fox",
    location: "Thornridge Cir. Syracuse, Connecticut",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip",
    name: "Esther Howard",
    location: "Washington Ave. Manchester, Kentucky",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
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
            What People Say After Used Our Service
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/95 sm:text-base lg:pt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip
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
