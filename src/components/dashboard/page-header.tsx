"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      data-dash-reveal
      className={cn(
        "relative overflow-hidden rounded-2xl bg-brand px-5 py-5 text-white sm:px-7 sm:py-6",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-brand-red/25 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-10 size-56 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/60 uppercase">{eyebrow}</p>
          ) : null}
          <h1 className="mt-1 font-heading text-[clamp(1.5rem,4vw,2rem)] leading-tight text-white">{title}</h1>
          {description ? <p className="mt-1.5 max-w-xl text-sm text-white/70">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
