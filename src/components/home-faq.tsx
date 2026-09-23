"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RiAddLine, RiSubtractLine } from "react-icons/ri";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAQ_ITEMS = [
  {
    question: "How do I sell my truck on SoCalTruckTrade?",
    answer:
      "Create a free account, post your listing with photos and details, and chat with interested buyers. Or skip the listing and request an offer using the form above.",
  },
  {
    question: "Do I need an account to get an offer?",
    answer:
      "No. Fill in a few details about your truck and we'll get back to you.",
  },
  {
    question: "What types of trucks can I find here?",
    answer:
      "Semi trucks, box trucks, medium-duty commercial trucks and pickups from brands like Freightliner, Peterbilt, Kenworth, Ford and Ram.",
  },
  {
    question: "Is it free to list a truck?",
    answer:
      "Creating an account and browsing listings is free. Contact us for current listing fee details.",
  },
  {
    question: "Which areas do you serve?",
    answer:
      "We're based in Anaheim, California, and serve all of California plus Nevada, Arizona and Oregon.",
  },
] as const;

export default function HomeFaq() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const bits = section.querySelectorAll<HTMLElement>("[data-faq-reveal]");

      if (reduced) {
        gsap.set(bits, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(bits, { autoAlpha: 0, y: 24 });

      gsap.to(bits, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
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
      aria-labelledby="home-faq-heading"
    >
      <div className="container-site">
        <h2
          id="home-faq-heading"
          data-faq-reveal
          className="text-center font-heading uppercase leading-[1.1] tracking-[0.04em] text-black text-[clamp(1.75rem,6vw,50px)]"
        >
          Frequently Asked Questions
        </h2>

        <div
          data-faq-reveal
          className="mx-auto mt-10 max-w-3xl divide-y divide-black/10 border-y border-black/10 sm:mt-12 lg:mt-14"
        >
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  id={`faq-question-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full cursor-pointer items-start justify-between gap-4 py-5 text-left sm:py-6"
                >
                  <h3 className="font-heading text-[clamp(1rem,2.5vw,1.2rem)] leading-snug tracking-[0.02em] text-black">
                    {item.question}
                  </h3>
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white sm:size-9"
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <RiSubtractLine className="size-5" />
                    ) : (
                      <RiAddLine className="size-5" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={
                    isOpen
                      ? "pb-5 text-sm leading-relaxed text-black/75 sm:pb-6 sm:text-base"
                      : "hidden"
                  }
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
