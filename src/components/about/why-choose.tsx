"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RiCheckLine } from "react-icons/ri";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REASONS = [
  {
    title: "Trucks only",
    body: "Shop and list semis, box trucks, medium-duty trucks, and pickups in one marketplace.",
  },
  {
    title: "Buy from the owner",
    body: "Search listings, compare price and mileage, and message the seller directly. There is no middleman in the deal.",
  },
  {
    title: "Sell your way",
    body: "Post a free listing and talk with buyers, or tell us about the truck and ask for an offer.",
  },
  {
    title: "Close to the truck",
    body: "We are based in Anaheim and connect buyers and sellers across California, Nevada, Arizona, and Oregon.",
  },
] as const;

export default function WhyChoose() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const bits = section.querySelectorAll<HTMLElement>("[data-why-item]");

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
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="bg-white py-16 sm:py-20 lg:py-24"
      aria-labelledby="why-choose-heading"
    >
      <div className="container-site">
        <h2
          id="why-choose-heading"
          data-why-item
          className="mx-auto max-w-4xl text-center font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
        >
          Why Choose SoCal Truck Trade?
        </h2>
        <ul className="mt-10 grid list-none grid-cols-1 gap-6 p-0 sm:mt-12 md:grid-cols-2 lg:mt-14 lg:gap-8">
          {REASONS.map((reason) => (
            <li key={reason.title} data-why-item>
              <article className="flex h-full gap-4 rounded-lg bg-neutral-100 px-5 py-6 sm:px-6 sm:py-7">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white"
                  aria-hidden="true"
                >
                  <RiCheckLine className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-black sm:text-xl">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/75 sm:text-base">
                    {reason.body}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
