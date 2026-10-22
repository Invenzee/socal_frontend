"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export default function LegalDocument({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const pageRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const bits = page.querySelectorAll("[data-legal]");
      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        bits,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" },
      );
    },
    { scope: pageRef },
  );

  return (
    <main ref={pageRef} className="bg-neutral-100 pb-16 sm:pb-20 lg:pb-24">
      <div className="container-site pt-10 sm:pt-12 lg:pt-14">
        <div data-legal className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Legal</p>
          <h1 className="mt-3 font-heading uppercase leading-[1.08] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]">
            {title}
          </h1>
          <p className="mt-4 text-sm text-black/55">Last updated {updated}</p>
          <p className="mt-5 text-sm leading-relaxed text-black/75 sm:text-base">{intro}</p>
        </div>

        <div className="mt-10 max-w-3xl space-y-8">
          {sections.map((section) => (
            <section key={section.heading} data-legal>
              <h2 className="text-lg font-semibold text-black sm:text-xl">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-black/75 sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p data-legal className="mt-10 max-w-3xl text-sm text-black/60">
          <Link href="/privacy" className="font-semibold text-brand hover:underline">
            Privacy Policy
          </Link>
          <span className="px-2">·</span>
          <Link href="/terms" className="font-semibold text-brand hover:underline">
            Terms and Conditions
          </Link>
          <span className="px-2">·</span>
          <Link href="/contact" className="font-semibold text-brand hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </main>
  );
}
