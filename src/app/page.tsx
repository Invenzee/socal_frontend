"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { RiCheckLine } from "react-icons/ri";
import GetStartedActions from "@/components/get-started-actions";
import Testimonials from "@/components/testimonials";
import ReadyToListings from "@/components/ready-to-listings";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SELL_POINTS = [
  "Quick Appraisal & Instant Offers",
  "Same-Day Payment Options",
  "We Handle Paperwork & Pick-Up",
] as const;

const SELL_PHONE = "+1 310-862-9113";
const SELL_PHONE_HREF = "tel:+13108629113";

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

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pillRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const sellRef = useRef<HTMLSpanElement>(null);
  const moveRef = useRef<HTMLElement>(null);
  const moveHeadingRef = useRef<HTMLHeadingElement>(null);
  const moveCardRef = useRef<HTMLDivElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const needRef = useRef<HTMLElement>(null);
  const needBgRef = useRef<HTMLDivElement>(null);
  const needContentRef = useRef<HTMLDivElement>(null);
  const needUnderlineRef = useRef<SVGPathElement>(null);
  const needCtaRef = useRef<HTMLAnchorElement>(null);
  const brandsRef = useRef<HTMLElement>(null);
  const brandsHeadingRef = useRef<HTMLHeadingElement>(null);
  const brandsSubRef = useRef<HTMLParagraphElement>(null);
  const brandsViewportRef = useRef<HTMLDivElement>(null);
  const brandsTrackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const bg = bgRef.current;
      const image = imageRef.current;
      const heading = headingRef.current;
      const pill = pillRef.current;
      const cta = ctaRef.current;
      const sell = sellRef.current;
      if (!hero || !bg || !image || !heading || !pill || !cta) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set([heading, pill, cta, image], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          scaleX: 1,
        });
        return;
      }

      gsap.set(heading, { autoAlpha: 0, y: 40, scale: 0.96 });
      gsap.set(pill, { autoAlpha: 0, scaleX: 0.35 });
      gsap.set(cta, { autoAlpha: 0, y: 28 });
      gsap.set(image, { scale: 1.12 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.to(image, { scale: 1, duration: 2.5, ease: "power2.out" }, 0);
      intro.to(
        heading,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 },
        0.18
      );
      intro.to(
        pill,
        { autoAlpha: 1, scaleX: 1, duration: 0.7, ease: "power3.out" },
        0.4
      );
      intro.to(cta, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.55);

      if (sell) {
        gsap.to(sell, {
          textShadow: "0 0 22px rgba(255,50,50,0.55)",
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 1.2,
        });
      }

      gsap.to(bg, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

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
    { scope: heroRef }
  );

  useGSAP(
    () => {
      const section = moveRef.current;
      const heading = moveHeadingRef.current;
      const card = moveCardRef.current;
      const path = underlinePathRef.current;
      if (!section || !heading || !card || !path) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const length = path.getTotalLength();

      if (reduced) {
        gsap.set([heading, card], { autoAlpha: 1, y: 0 });
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
        return;
      }

      gsap.set(heading, { autoAlpha: 0, y: 32 });
      gsap.set(card, { autoAlpha: 0, y: 48 });
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      });

      intro.to(heading, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(
        path,
        { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" },
        0.28
      );
      intro.to(card, { autoAlpha: 1, y: 0, duration: 0.85 }, 0.22);
    },
    { scope: moveRef }
  );

  useGSAP(
    () => {
      const section = needRef.current;
      const bg = needBgRef.current;
      const content = needContentRef.current;
      const path = needUnderlineRef.current;
      const cta = needCtaRef.current;
      if (!section || !bg || !content || !path) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const length = path.getTotalLength();
      const items = content.querySelectorAll("[data-need-item]");

      if (reduced) {
        gsap.set([content, items], { autoAlpha: 1, y: 0, x: 0 });
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: 0 });
        return;
      }

      gsap.set(content, { autoAlpha: 0, x: -28 });
      gsap.set(items, { autoAlpha: 0, y: 16 });
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      intro.to(content, { autoAlpha: 1, x: 0, duration: 0.8 });
      intro.to(
        path,
        { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" },
        0.25
      );
      intro.to(
        items,
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 },
        0.35
      );

      gsap.to(bg, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      if (!cta) return;

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
    { scope: needRef }
  );

  useGSAP(
    () => {
      const section = brandsRef.current;
      const heading = brandsHeadingRef.current;
      const sub = brandsSubRef.current;
      const viewport = brandsViewportRef.current;
      const track = brandsTrackRef.current;
      if (!section || !heading || !sub || !viewport || !track) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const items = track.querySelectorAll<HTMLElement>("[data-brand-item]");

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
        return slot;
      };

      sizeItems();

      if (reduced) {
        gsap.set([heading, sub, viewport], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(heading, { autoAlpha: 0, y: 28 });
      gsap.set(sub, { autoAlpha: 0, y: 16 });
      gsap.set(viewport, { autoAlpha: 0, y: 20 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      intro.to(heading, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(sub, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.15);
      intro.to(viewport, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.28);

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
    { scope: brandsRef }
  );

  return (
    <main>
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[calc(100svh-4.75rem)] items-center justify-center overflow-hidden sm:min-h-[calc(100svh-5rem)]"
      >
        <div
          ref={bgRef}
          className="absolute inset-x-0 -top-[12%] h-[124%] w-full will-change-transform"
        >
          <div ref={imageRef} className="absolute inset-0 will-change-transform">
            <Image
              src="/hero-bg.webp"
              alt="Pickup trucks lined up at night"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_70%]"
            />
          </div>
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
        </div>

        <div className="relative z-10 container-site flex flex-col items-center px-0 py-16 text-center sm:py-20">
          <h1
            ref={headingRef}
            className="font-heading uppercase leading-[1.08] tracking-[0.06em] text-white text-[clamp(1.65rem,6.4vw,4.5rem)]"
          >
            <span className="block whitespace-nowrap">
              Ready to{" "}
              <span ref={sellRef} className="text-brand-red">
                Sell
              </span>
            </span>
            <span className="block whitespace-nowrap">Your Truck?</span>
          </h1>

          <p
            ref={pillRef}
            className="mt-5 inline-flex origin-center items-center justify-center rounded-full bg-brand-red px-5 py-2.5 text-center text-[clamp(0.68rem,1.9vw,1.05rem)] font-bold uppercase tracking-[0.18em] text-white whitespace-nowrap sm:mt-6 sm:px-12 sm:py-3"
          >
            Get a Fast, Fair Offer Today.
          </p>

          <Link
            ref={ctaRef}
            href="/sell"
            className="mt-6 inline-flex items-center justify-center rounded-[8px] bg-brand px-8 py-3 text-base font-semibold text-white sm:mt-7 sm:px-10 sm:py-3.5 sm:text-lg"
          >
            Sell Your Truck
          </Link>
        </div>
      </section>

      <section
        ref={moveRef}
        className="bg-neutral-100 pt-16 pb-[calc(4rem+24px)] sm:pt-20 sm:pb-[calc(5rem+24px)] lg:pt-24 lg:pb-[calc(6rem+24px)]"
      >
        <div className="container-site flex flex-col items-center text-center">
          <h2
            ref={moveHeadingRef}
            className="font-heading uppercase leading-[1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            Move{" "}
            <span className="relative inline-block pb-[0.18em]">
              What
              <svg
                className="pointer-events-none absolute left-1/2 top-[0.95em] h-[0.22em] w-[108%] -translate-x-1/2 overflow-visible text-brand"
                viewBox="0 0 184 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  ref={underlinePathRef}
                  d="M166.795 16.9966L0.143799 11.779L183.144 2.99658"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </span>
            <span className="block">Matters</span>
          </h2>

          <div
            ref={moveCardRef}
            className="mt-10 w-full rounded-lg shadow-[0_24px_0_0_var(--color-brand)] sm:mt-12 lg:mt-14"
          >
            <div className="overflow-hidden rounded-lg border-b-[3px] border-brand-red">
              <Image
                src="/move-what-matter-image.webp"
                alt="White utility truck with service bed"
                width={1596}
                height={772}
                sizes="(max-width: 1140px) calc(100vw - 2rem), 1140px"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={needRef}
        className="relative isolate flex min-h-[520px] items-center overflow-hidden sm:min-h-[580px] lg:min-h-[640px]"
      >
        <div
          ref={needBgRef}
          className="absolute inset-x-0 -top-[10%] h-[120%] w-full will-change-transform"
        >
          <Image
            src="/need-to-sell-sec-image.webp"
            alt="Semi trucks parked in a lot at sunset"
            fill
            sizes="100vw"
            className="object-cover object-[center_right]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,#000_45%,transparent_100%)] md:bg-[linear-gradient(to_right,#000_0%,#000_22%,transparent_70%)]" />

        <div
          ref={needContentRef}
          className="relative z-10 container-site py-16 sm:py-20 lg:py-24"
        >
          <div className="max-w-xl text-left">
            <h2 className="font-heading uppercase leading-[1.25] tracking-[0.04em] text-white text-[clamp(1.75rem,6vw,50px)]">
              Need to{" "}
              <span className="relative pb-[0.18em]">
                Sell
                <svg
                  className="pointer-events-none absolute left-1/2 top-[0.95em] h-[0.22em] w-[118%] -translate-x-1/2 overflow-visible text-brand"
                  viewBox="0 0 184 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    ref={needUnderlineRef}
                    d="M166.795 16.9966L0.143799 11.779L183.144 2.99658"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              </span>{" "} <br className="max-sm:hidden" />
              Your Truck?
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-white/90 sm:mt-5 sm:text-base">
              Get a fast, fair cash offer on your truck. We buy all makes and
              models and take care of the details so you don&apos;t have to.
            </p>

            <ul className="mt-6 flex flex-col gap-3 sm:mt-7">
              {SELL_POINTS.map((point) => (
                <li
                  key={point}
                  data-need-item
                  className="flex items-center gap-3 text-sm font-medium text-white sm:text-base"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red sm:size-7">
                    <RiCheckLine className="size-4 text-white sm:size-[18px]" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-6">
              <a
                ref={needCtaRef}
                href={SELL_PHONE_HREF}
                className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white sm:px-8 sm:text-base"
              >
                Call Now
              </a>
              <a
                href={SELL_PHONE_HREF}
                className="text-base font-medium text-white sm:text-lg"
              >
                {SELL_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={brandsRef}
        className="overflow-hidden bg-neutral-100 py-16 sm:py-20 lg:py-24"
      >
        <div className="container-site text-center">
          <h2
            ref={brandsHeadingRef}
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            <span className="block">Our Most</span>
            <span className="block">
              Popular <span className="text-brand">Brands</span>
            </span>
          </h2>
          <p
            ref={brandsSubRef}
            className="mt-3 text-sm text-black sm:mt-4 sm:text-base"
          >
            Browse inventory by Brand Name
          </p>
        </div>

        <div
          ref={brandsViewportRef}
          className="w-full mt-10 overflow-hidden sm:mt-12 lg:mt-14"
        >
          <div
            ref={brandsTrackRef}
            className="flex w-max will-change-transform"
            aria-label="Popular truck brands"
          >
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                data-brand-item
                className="flex shrink-0 items-center justify-center px-3 sm:px-4"
              >
                <div className="group flex h-14 w-full max-w-[150px] items-center justify-center sm:h-16">
                  <Image
                    src={brand.src}
                    alt={brand.name}
                    width={150}
                    height={64}
                    className="h-10 max-w-full object-contain grayscale transition-[filter,transform] duration-300 ease-out group-hover:scale-105 group-hover:grayscale-0 sm:h-12"
                    style={{ width: "auto" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GetStartedActions />
      <Testimonials />
      <ReadyToListings />
    </main>
  );
}
