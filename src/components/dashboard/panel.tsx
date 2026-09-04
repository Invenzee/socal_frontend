"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
};

export default function Panel({
  title,
  description,
  icon,
  action,
  children,
  bodyClassName,
  className,
}: PanelProps) {
  return (
    <section data-dash-reveal className={cn("dash-panel flex flex-col overflow-hidden", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-brand/10 px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon ? (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/10 text-base text-brand">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate font-heading text-[15px] leading-tight text-black">{title}</h2>
              {description ? <p className="truncate text-xs text-black/45">{description}</p> : null}
            </div>
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("flex-1", bodyClassName ?? "p-4 sm:p-5")}>{children}</div>
    </section>
  );
}
