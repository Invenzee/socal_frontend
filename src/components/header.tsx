"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RiLockLine, RiMenuLine, RiCloseLine, RiDashboardLine } from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UnreadBadge from "@/components/unread-badge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NAV_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/listings", label: "Browse Trucks" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

const HIDDEN_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/dashboard"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHidden = HIDDEN_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const onScroll = () => {
        if (window.scrollY > 8) header.classList.add("shadow-[0_4px_24px_rgba(0,0,0,0.08)]");
        else header.classList.remove("shadow-[0_4px_24px_rgba(0,0,0,0.08)]");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      const hoverCleanups: Array<() => void> = [];
      if (!reduced) {
        header.querySelectorAll<HTMLElement>("[data-cta]").forEach((el) => {
          const enter = () =>
            gsap.to(el, { scale: 1.04, filter: "brightness(1.08)", duration: 0.22, ease: "power2.out", overwrite: "auto" });
          const leave = () =>
            gsap.to(el, { scale: 1, filter: "brightness(1)", duration: 0.22, ease: "power2.out", overwrite: "auto" });
          el.addEventListener("mouseenter", enter);
          el.addEventListener("mouseleave", leave);
          hoverCleanups.push(() => {
            el.removeEventListener("mouseenter", enter);
            el.removeEventListener("mouseleave", leave);
          });
        });
      }

      return () => {
        hoverCleanups.forEach((fn) => fn());
        window.removeEventListener("scroll", onScroll);
      };
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(menu, { autoAlpha: menuOpen ? 1 : 0, y: 0 });
        return;
      }
      if (menuOpen) {
        gsap.fromTo(menu, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" });
      }
    },
    { dependencies: [menuOpen] },
  );

  const closeMenu = () => setMenuOpen(false);

  if (isHidden) return null;

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white transition-[box-shadow] duration-300">
      <div className="container-site grid h-[4.75rem] grid-cols-[auto_1fr_auto] items-center gap-3 sm:h-20 sm:gap-4">
        <Link href="/" className="shrink-0" onClick={closeMenu}>
          <Image src="/logo.webp" alt="SoCal Truck Trade" width={87} height={89} priority className="h-14 w-auto sm:h-[3.85rem]" />
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 items-center justify-center gap-5 lg:flex xl:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 whitespace-nowrap text-[15px] font-semibold text-black transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex lg:gap-3">
            <Link data-cta href="/sell" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] bg-brand px-4 py-2.5 text-sm font-semibold text-white">
              Sell Your Truck
            </Link>
            <Link data-cta href="/listings" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] bg-brand-red px-4 py-2.5 text-sm font-semibold text-white">
              View Listings
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-1 inline-flex items-center gap-1.5 text-sm font-semibold text-black">
                  {user.fullName.split(" ")[0]}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/messages")}>
                    Messages
                    <UnreadBadge />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      void logout();
                      router.push("/");
                    }}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="ml-1 hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-black transition-colors hover:text-brand lg:inline-flex">
                <RiLockLine className="size-4" aria-hidden />
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-black lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <RiCloseLine className="size-7" /> : <RiMenuLine className="size-7" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div ref={menuRef} id="mobile-nav" className="border-t border-black/5 bg-white py-5 lg:hidden">
          <div className="container-site">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-base font-semibold text-black hover:bg-neutral-50">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 md:hidden">
              <Link href="/sell" onClick={closeMenu} className="inline-flex items-center justify-center rounded-[8px] bg-brand px-5 py-3 text-sm font-semibold text-white">
                Sell Your Truck
              </Link>
              <Link href="/listings" onClick={closeMenu} className="inline-flex items-center justify-center rounded-[8px] bg-brand-red px-5 py-3 text-sm font-semibold text-white">
                View Listings
              </Link>
            </div>
            {user ? (
              <Link href="/dashboard" onClick={closeMenu} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-black">
                <RiDashboardLine className="size-4" />
                Dashboard
              </Link>
            ) : (
              <Link href="/login" onClick={closeMenu} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-black">
                <RiLockLine className="size-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
