"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

gsap.registerPlugin(useGSAP);

type AuthShellProps = {
  title: string;
  backgroundSrc: string;
  backgroundAlt: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({
  title,
  backgroundSrc,
  backgroundAlt,
  children,
  footer,
}: AuthShellProps) {
  const shellRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const shell = shellRef.current;
      if (!shell) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const panel = shell.querySelector("[data-auth-panel]");

      if (reduced) {
        gsap.set(panel, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(panel, { autoAlpha: 0, y: 24 });
      gsap.to(panel, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      });
    },
    { scope: shellRef }
  );

  return (
    <main
      ref={shellRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="absolute inset-0">
        <Image
          src={backgroundSrc}
          alt={backgroundAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/78" />
      </div>

      <div
        data-auth-panel
        className="relative z-10 w-full max-w-[420px] text-center"
      >
        <Link href="/" className="inline-block">
          <Image
            src="/logo.webp"
            alt="SoCal Truck Trade"
            width={120}
            height={140}
            className="mx-auto h-auto w-[92px] object-contain sm:w-[104px]"
            priority
          />
        </Link>

        <h1 className="mt-6 text-[clamp(1.65rem,4vw,2rem)] font-bold text-black">
          {title}
        </h1>

        <div className="mt-8 text-left">{children}</div>

        <p className="mt-6 text-sm text-black/55">{footer}</p>
      </div>
    </main>
  );
}

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  showPasswordToggle?: boolean;
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  showPasswordToggle = false,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputType = showPasswordToggle ? (visible ? "text" : "password") : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm text-black/45"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-black/10 bg-white/90 px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-brand sm:text-[15px]"
        />
        {showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
          >
            {visible ? (
              <RiEyeOffLine className="size-5" />
            ) : (
              <RiEyeLine className="size-5" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-7 flex w-full items-center justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-[filter,transform] duration-200 hover:brightness-110 sm:text-base"
    >
      {children}
    </button>
  );
}
