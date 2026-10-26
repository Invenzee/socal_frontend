"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RiFacebookFill, RiInstagramFill } from "react-icons/ri";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

const SITEMAP = [
  { href: "/about", label: "About" },
  { href: "/listings", label: "View Truck Listings" },
  { href: "/sell", label: "Sell My Truck" },
  { href: "/contact", label: "Contact" },
] as const;

const CONTACT = [
  { href: "tel:+13109629113", label: "+1 310-962-9113" },
  { href: "mailto:info@socaltrucktrade.com", label: "info@socaltrucktrade.com" },
  { href: "https://www.socaltrucktrade.com", label: "www.socaltrucktrade.com" },
] as const;

const SOCIALS = [
  {
    href: "https://www.instagram.com/so.caltrucktrade/",
    label: "Instagram",
    icon: RiInstagramFill,
    className: "bg-brand text-white",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61595326367446",
    label: "Facebook",
    icon: RiFacebookFill,
    className: "bg-white/20 text-white",
  },
] as const;

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const isAuthPage =
    AUTH_ROUTES.has(pathname) || pathname.startsWith("/dashboard");

  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const cols = footer.querySelectorAll("[data-footer-col]");
      const bottom = footer.querySelector("[data-footer-bottom]");

      if (reduced) {
        gsap.set([cols, bottom], { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(cols, { autoAlpha: 0, y: 28 });
      gsap.set(bottom, { autoAlpha: 0, y: 16 });

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: footer,
          start: "top 88%",
          once: true,
        },
      });

      intro.to(cols, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
      });
      intro.to(bottom, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);
    },
    { scope: footerRef }
  );

  if (isAuthPage) return null;

  return (
    <footer ref={footerRef} className="bg-black text-white">
      <div className="container-site py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div data-footer-col className="max-w-sm">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.webp"
                alt="SoCal Truck Trade"
                width={120}
                height={140}
                className="h-auto w-[88px] object-contain sm:w-[100px]"
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              SoCalTruckTrade is a truck-only marketplace based in Anaheim,
              California. Buy or sell semis, box trucks and pickups, and connect
              directly with buyers and sellers across California and nearby
              states.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ href, label, icon: Icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex size-9 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 ${className}`}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div data-footer-col>
            <h3 className="font-heading text-base text-white sm:text-lg">
              Sitemap
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-white sm:text-base"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-footer-col>
            <h3 className="font-heading text-base text-white sm:text-lg">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {CONTACT.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-white sm:text-base"
                    {...(item.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          data-footer-bottom
          className="mt-12 flex flex-col items-center gap-3 border-t border-white/15 pt-5 text-center text-xs sm:mt-14 md:flex-row md:justify-between md:gap-4"
        >
          <p className="text-white/60 md:flex-1 md:text-left">
            ©Copyright 2026 Socal All rights reserved.
          </p>
          <p className="text-white/60 md:flex-1 md:text-center">
            Design and develop by{" "}
            <a
              href="https://techcole.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-red"
            >
              Techcole
            </a>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:flex-1 md:justify-end">
            <Link href="/privacy" className="text-white/90 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <span className="h-3 w-px bg-white/30" aria-hidden />
            <Link href="/terms" className="text-white/90 transition-colors hover:text-white">
              Terms and Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
