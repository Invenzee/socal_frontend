"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand/8 text-2xl text-brand ring-1 ring-brand/15">
        {icon}
      </span>
      <p className="mt-4 font-heading text-lg text-black">{title}</p>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-black/50">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
