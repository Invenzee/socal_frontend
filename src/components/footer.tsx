"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  RiInstagramFill,
  RiYoutubeFill,
  RiTwitterXFill,
} from "react-icons/ri";

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
  { href: "/faqs", label: "FAQ" },
] as const;

const CONTACT = [
  { href: "tel:+13108629113", label: "+1 310-862-9113" },
  { href: "mailto:so.caltrucktrade@gmail.com", label: "so.caltrucktrade@gmail.com" },
  { href: "https://www.socaltrucktrade.com", label: "www.socaltrucktrade.com" },
] as const;

const SOCIALS = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: RiInstagramFill,
    className: "bg-brand text-white",
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: RiYoutubeFill,
    className: "bg-white/20 text-white",
  },
  {
    href: "https://x.com",
    label: "X",
    icon: RiTwitterXFill,
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
            <h3 className="text-base font-semibold text-white sm:text-lg">
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
            <h3 className="text-base font-semibold text-white sm:text-lg">
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
          className="mt-12 border-t border-white/15 pt-6 text-center sm:mt-14"
        >
          <p className="text-xs text-white/60 sm:text-sm">
            ©Copyright 2026 Socal All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
