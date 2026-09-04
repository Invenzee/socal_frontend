"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

const TONES = {
  brand: {
    shell: "bg-brand text-white",
    label: "text-white/65",
    value: "text-white",
    icon: "bg-white/15 text-white",
    foot: "text-white/70 hover:text-white",
  },
  red: {
    shell: "bg-brand-red text-white",
    label: "text-white/70",
    value: "text-white",
    icon: "bg-white/20 text-white",
    foot: "text-white/80 hover:text-white",
  },
  ink: {
    shell: "bg-black text-white",
    label: "text-white/55",
    value: "text-white",
    icon: "bg-white/12 text-white",
    foot: "text-white/65 hover:text-white",
  },
  plain: {
    shell: "dash-panel text-black",
    label: "text-black/50",
    value: "text-brand",
    icon: "bg-brand/10 text-brand",
    foot: "text-brand hover:text-brand-red",
  },
} as const;

export type StatTone = keyof typeof TONES;

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.current = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame.current);
    }
    const start = performance.now();
    const from = 0;
    const duration = 700;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return value;
}

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: StatTone;
  hint?: string;
  href?: string;
  linkLabel?: string;
  format?: (value: number) => string;
};

export default function StatCard({
  label,
  value,
  icon,
  tone = "plain",
  hint,
  href,
  linkLabel = "View",
  format,
}: StatCardProps) {
  const animated = useCountUp(value);
  const styles = TONES[tone];

  return (
    <div
      data-dash-reveal
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 sm:p-5",
        tone === "plain" ? "hover:shadow-md" : "shadow-sm hover:shadow-lg",
        styles.shell,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-current opacity-[0.06] blur-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[11px] font-semibold tracking-[0.14em] uppercase", styles.label)}>{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-lg", styles.icon)}>{icon}</span>
      </div>
      <p className={cn("mt-3 text-3xl leading-none font-semibold tabular-nums", styles.value)}>
        {format ? format(animated) : animated.toLocaleString("en-US")}
      </p>
      {hint ? <p className={cn("mt-2 text-xs", styles.label)}>{hint}</p> : null}
      {href ? (
        <Link
          href={href}
          className={cn("mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-colors", styles.foot)}
        >
          {linkLabel}
          <RiArrowRightUpLine className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
