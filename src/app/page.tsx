"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { RiCheckLine } from "react-icons/ri";
import GetStartedActions from "@/components/get-started-actions";
import Testimonials from "@/components/testimonials";
import HomeFaq from "@/components/home-faq";
import ReadyToListings from "@/components/ready-to-listings";
import OfferHomeSection from "@/components/offer/offer-home-section";
import { useAuth } from "@/providers/auth-provider";
import { useOfferDialog } from "@/providers/offer-dialog-provider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SELL_POINTS = [
  "Quick appraisal and fast offers",
  "Same-day payment options",
  "Help with paperwork and pick-up",
] as const;

const SELL_PHONE = "+1 310-862-9113";
const SELL_PHONE_HREF = "tel:+13108629113";

const SHOP_BY_BRAND_CATEGORIES = [
  {
    title: "Heavy-Duty & Semi Trucks",
    description:
      "Freightliner, Peterbilt, Kenworth, Volvo, Mack, International and Western Star trucks for long-haul, regional and vocational work.",
    imageSrc: "/shop-brand-heavy-duty.webp",
    imageAlt: "Red Freightliner semi truck on a highway",
  },
  {
    title: "Medium-Duty & Commercial Trucks",
    description:
      "Hino and Isuzu trucks for local delivery, box truck routes and light commercial jobs.",
    imageSrc: "/shop-brand-medium-duty.webp",
    imageAlt: "Orange semi truck hauling a commercial load",
  },
  {
    title: "Pickup Trucks",
    description:
      "Ford, Ram, Chevrolet, GMC, Toyota and Nissan pickups for work sites, towing and everyday driving.",
    imageSrc: "/shop-brand-pickup.webp",
    imageAlt: "Line of white semi trucks parked along a road",
  },
] as const;

const HOW_IT_WORKS = {
  sellers: {
    title: "For Sellers",
    steps: [
      {
        lead: "Create your account.",
        rest: "Sign up for free in a minute.",
      },
      {
        lead: "Post your listing.",
        rest: "Add photos, price, mileage and details.",
      },
      {
        lead: "Chat with buyers.",
        rest: "Message interested buyers directly and close the deal your way.",
      },
    ],
  },
  buyers: {
    title: "For Buyers",
    steps: [
      {
        lead: "Search listings.",
        rest: "Filter by brand, year, price and location.",
      },
      {
        lead: "Message the seller.",
        rest: "Ask questions and request more photos.",
      },
      {
        lead: "Inspect and buy.",
        rest: "Meet the seller and drive away with confidence.",
      },
    ],
  },
} as const;

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { requestOpen } = useOfferDialog();
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pillRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const moveRef = useRef<HTMLElement>(null);
  const moveHeadingRef = useRef<HTMLHeadingElement>(null);
  const moveCardRef = useRef<HTMLDivElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const needRef = useRef<HTMLElement>(null);
  const needBgRef = useRef<HTMLDivElement>(null);
  const needContentRef = useRef<HTMLDivElement>(null);
  const needUnderlineRef = useRef<SVGPathElement>(null);
  const needCtaRef = useRef<HTMLAnchorElement>(null);
  const shopBrandRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const areasServedRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const hero = heroRef.current;
      const bg = bgRef.current;
      const image = imageRef.current;
      const heading = headingRef.current;
      const pill = pillRef.current;
      const body = bodyRef.current;
      const cta = ctaRef.current;
      if (!hero || !bg || !image || !heading || !pill || !body || !cta) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduced) {
        gsap.set([heading, pill, body, cta, image], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          scaleX: 1,
        });
        return;
      }

      gsap.set(heading, { autoAlpha: 0, y: 40, scale: 0.96 });
      gsap.set(pill, { autoAlpha: 0, scaleX: 0.35 });
      gsap.set(body, { autoAlpha: 0, y: 24 });
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
      intro.to(body, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.52);
      intro.to(cta, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.68);

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
      const section = shopBrandRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const bits = section.querySelectorAll<HTMLElement>("[data-shop-brand-item]");

      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(bits, { autoAlpha: 0, y: 28 });

      gsap.to(bits, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      const cleanups: Array<() => void> = [];
      section
        .querySelectorAll<HTMLElement>("[data-shop-brand-card]")
        .forEach((card) => {
          const enter = () =>
            gsap.to(card, {
              y: -6,
              scale: 1.01,
              duration: 0.22,
              ease: "power2.out",
              overwrite: "auto",
            });
          const leave = () =>
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.22,
              ease: "power2.out",
              overwrite: "auto",
            });
          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("mouseleave", leave);
          });
        });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: shopBrandRef }
  );

  useGSAP(
    () => {
      const section = howItWorksRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const bits = section.querySelectorAll<HTMLElement>("[data-how-item]");

      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0, x: 0 });
        return;
      }

      const heading = section.querySelector("[data-how-heading]");
      const sellers = section.querySelector("[data-how-sellers]");
      const buyers = section.querySelector("[data-how-buyers]");

      gsap.set(heading, { autoAlpha: 0, y: 28 });
      gsap.set(sellers, { autoAlpha: 0, x: -36 });
      gsap.set(buyers, { autoAlpha: 0, x: 36 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      intro.to(heading, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(sellers, { autoAlpha: 1, x: 0, duration: 0.75 }, 0.18);
      intro.to(buyers, { autoAlpha: 1, x: 0, duration: 0.75 }, 0.18);
    },
    { scope: howItWorksRef }
  );

  useGSAP(
    () => {
      const section = areasServedRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const bits = section.querySelectorAll<HTMLElement>("[data-areas-item]");

      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0, x: 0 });
        return;
      }

      const copy = section.querySelector("[data-areas-copy]");
      const map = section.querySelector("[data-areas-map]");

      gsap.set(copy, { autoAlpha: 0, y: 28 });
      gsap.set(map, { autoAlpha: 0, y: 32, scale: 0.98 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      intro.to(copy, { autoAlpha: 1, y: 0, duration: 0.7 });
      intro.to(
        map,
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
        0.15
      );
    },
    { scope: areasServedRef }
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

        <div className="relative z-10 w-full min-w-0 py-16 sm:py-20">
        <div className="container-site flex min-w-0 flex-col items-center px-0 text-center">
          <p
            ref={pillRef}
            className="mb-5 inline-flex max-w-full origin-center items-center justify-center rounded-full bg-brand-red px-5 py-2.5 text-center text-[clamp(0.48rem,1.4vw,0.9rem)] font-bold uppercase tracking-[0.14em] text-white text-balance sm:px-10 sm:py-3"
          >
            Get a fast, fair offer today.
          </p>
          <h1
            ref={headingRef}
            className="w-full min-w-0 font-heading uppercase leading-[1.08] tracking-[0.04em] text-white text-[clamp(1.45rem,4.8vw,3.35rem)]"
          >
            Buy &amp; Sell Trucks Across Southern California
          </h1>

          <p
            ref={bodyRef}
            className="mt-5 w-full min-w-0 max-w-[40rem] text-sm font-normal leading-relaxed text-white sm:mt-6 sm:text-base"
          >
            SoCalTruckTrade is Southern California&apos;s truck-only marketplace.
            Browse listings from local sellers, chat with them directly, or list
            your own truck in minutes. From semis to pickups, we make buying and
            selling simple.
          </p>

          <button
            ref={ctaRef}
            type="button"
            onClick={() => {
              if (loading) return;
              if (user) {
                router.push("/sell");
                return;
              }
              requestOpen();
            }}
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-[8px] bg-brand px-8 py-3 text-base font-semibold text-white transition-all duration-150 hover:scale-[1.04] hover:brightness-110 sm:mt-7 sm:px-10 sm:py-3.5 sm:text-lg"
          >
            Get an Offer
          </button>
        </div>
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
            </span>{" "}
            Matters
            <span className="block">Trucks for Every Job</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[42rem] text-sm font-normal leading-relaxed text-black sm:mt-6 sm:text-base">
            Whether you&apos;re hauling freight, running a fleet, or upgrading
            your work pickup, the right truck keeps your business moving.
            SoCalTruckTrade brings together new and used trucks from private
            sellers and businesses, so you can compare options and deal directly
            with the owner, with no middleman and no runaround.
          </p>

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
              </span>{" "}
              Your Truck
              <span className="block">Fast and Fair</span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-white/90 sm:mt-5 sm:text-base">
              Ready to sell? Tell us about your truck and get a fast, fair
              offer, or create a free account and post your own listing to reach
              buyers across California and neighboring states. We take care of
              the details so you don&apos;t have to.
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

      <OfferHomeSection />

      <section
        ref={shopBrandRef}
        className="bg-white py-16 sm:py-20 lg:py-24"
      >
        <div className="container-site text-center">
          <h2
            data-shop-brand-item
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            <span className="block">Shop Trucks</span>
            <span className="block">
              by <span className="text-brand">Brand</span>
            </span>
          </h2>
          <p
            data-shop-brand-item
            className="mt-3 text-sm text-black sm:mt-4 sm:text-base"
          >
            Browse inventory by brand name.
          </p>

          <ul className="mt-10 grid list-none grid-cols-1 gap-8 p-0 text-left sm:mt-12 lg:mt-14 lg:grid-cols-3 lg:gap-6">
            {SHOP_BY_BRAND_CATEGORIES.map((category) => (
              <li key={category.title} data-shop-brand-item>
                <article
                  data-shop-brand-card
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-black/8 bg-neutral-100 shadow-[0_12px_0_0_var(--color-brand)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-200">
                    <Image
                      src={category.imageSrc}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1140px) 33vw, 360px"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7">
                    <h3 className="font-heading text-[clamp(1.15rem,2.8vw,1.35rem)] leading-snug tracking-[0.02em] text-black">
                      {category.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/75 sm:text-[0.9375rem]">
                      {category.description}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section ref={howItWorksRef} className="bg-white pt-16 sm:pt-20 lg:pt-24">
        <div className="container-site text-center">
          <h2
            data-how-item
            data-how-heading
            className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
          >
            How It Works
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:mt-12 md:grid-cols-2 lg:mt-14">
          <div
            data-how-item
            data-how-sellers
            className="bg-brand-red text-white"
          >
            <div className="container-site py-12 sm:py-14 md:mr-0 md:max-w-[calc(1140px/2+0.5rem)] md:pr-6 lg:py-16 lg:pr-10">
              <h3 className="font-heading text-[clamp(1.35rem,4vw,2rem)] uppercase leading-none tracking-[0.04em]">
                {HOW_IT_WORKS.sellers.title}
              </h3>
              <ol className="mt-8 flex list-none flex-col gap-6 p-0 sm:mt-9 sm:gap-7">
                {HOW_IT_WORKS.sellers.steps.map((step, index) => (
                  <li key={step.lead} className="flex gap-4">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/35 text-sm font-semibold sm:size-9"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-base font-semibold leading-snug sm:text-lg">
                        {step.lead}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/90 sm:text-base">
                        {step.rest}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div
            data-how-item
            data-how-buyers
            className="bg-brand text-white"
          >
            <div className="container-site py-12 sm:py-14 md:ml-0 md:max-w-[calc(1140px/2+0.5rem)] md:pl-6 lg:py-16 lg:pl-10">
              <h3 className="font-heading text-[clamp(1.35rem,4vw,2rem)] uppercase leading-none tracking-[0.04em]">
                {HOW_IT_WORKS.buyers.title}
              </h3>
              <ol className="mt-8 flex list-none flex-col gap-6 p-0 sm:mt-9 sm:gap-7">
                {HOW_IT_WORKS.buyers.steps.map((step, index) => (
                  <li key={step.lead} className="flex gap-4">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/35 text-sm font-semibold sm:size-9"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <h4 className="text-base font-semibold leading-snug sm:text-lg">
                        {step.lead}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/90 sm:text-base">
                        {step.rest}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={areasServedRef}
        className="bg-neutral-100 py-16 sm:py-20 lg:py-24"
        aria-labelledby="areas-served-heading"
      >
        <div className="container-site grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div data-areas-item data-areas-copy>
            <h2
              id="areas-served-heading"
              className="font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
            >
              <span className="block">Serving Southern</span>
              <span className="block">
                California and{" "}
                <span className="text-brand">Nearby States</span>
              </span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-black/80 sm:mt-6 sm:text-base">
              Based in Anaheim, we connect truck buyers and sellers throughout
              Orange County, Los Angeles, the Inland Empire and San Diego, and
              across all of California. We also serve customers in neighboring
              Nevada, Arizona and Oregon, so you can find the right truck or the
              right buyer within driving distance.
            </p>
          </div>

          <div
            data-areas-item
            data-areas-map
            className="overflow-hidden rounded-lg border border-black/8 bg-white shadow-[0_16px_0_0_var(--color-brand-red)]"
          >
            <iframe
              title="Map of SoCalTruckTrade service area centered on Anaheim, California"
              src="https://maps.google.com/maps?q=Anaheim%2C+CA&z=8&ie=UTF8&iwloc=&output=embed"
              className="aspect-[4/3] w-full min-h-[240px] border-0 sm:min-h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <GetStartedActions />


      <Testimonials />
      <HomeFaq />
      <ReadyToListings />
    </main>
  );
}
