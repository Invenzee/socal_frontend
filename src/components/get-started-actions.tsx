"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ACTIONS = [
  {
    href: "/listings",
    title: "Browse Listings",
    src: "/browse-icon.webp",
    width: 302,
    height: 226,
    imageClassName: "h-auto w-[min(100%,200px)] object-contain transition-transform duration-300 ease-out group-hover:scale-105",
  },
  {
    href: "/sell",
    title: "Sell Your Truck",
    src: "/sell-icon.webp",
    width: 243,
    height: 226,
    imageClassName: "h-auto w-[min(100%,180px)] object-contain transition-transform duration-300 ease-out group-hover:scale-105",
  },
] as const;

export default function GetStartedActions() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const cards = section.querySelectorAll<HTMLElement>("[data-action-card]");

      if (reduced) {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 36 });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      const cleanups: Array<() => void> = [];
      cards.forEach((card) => {
        const enter = () =>
          gsap.to(card, {
            y: -6,
            duration: 0.22,
            ease: "power2.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(card, {
            y: 0,
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
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="bg-neutral-100 py-16 sm:py-20 lg:py-24"
    >
      <div className="container-site grid grid-cols-1 gap-12 sm:gap-14 md:grid-cols-2 md:gap-10 lg:gap-16">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            data-action-card
            className="group flex flex-col items-center text-center"
          >
            <div className="flex w-full max-w-[340px] items-center justify-center rounded-[28px] rounded-tr-[72px] bg-neutral-200/80 px-10 py-12 sm:px-12 sm:py-14">
              <Image
                src={action.src}
                alt=""
                width={action.width}
                height={action.height}
                className={action.imageClassName}
              />
            </div>
            <h3 className="mt-6 font-heading text-[clamp(1.35rem,3.5vw,2rem)] uppercase leading-none tracking-[0.04em] text-black sm:mt-7">
              {action.title}
            </h3>
            <span className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-black sm:mt-3 sm:text-sm">
              Get Started
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
