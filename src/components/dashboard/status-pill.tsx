"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-brand/10 text-brand ring-brand/25",
  active: "bg-brand/10 text-brand ring-brand/25",
  pending: "bg-amber-500/12 text-amber-700 ring-amber-500/25",
  draft: "bg-black/6 text-black/60 ring-black/12",
  rejected: "bg-brand-red/10 text-brand-red ring-brand-red/25",
  suspended: "bg-brand-red/10 text-brand-red ring-brand-red/25",
  sold: "bg-black/85 text-white ring-black/20",
  inactive: "bg-black/6 text-black/50 ring-black/12",
  chat: "bg-brand/10 text-brand ring-brand/25",
  phone: "bg-brand-red/10 text-brand-red ring-brand-red/25",
  admin: "bg-black/85 text-white ring-black/20",
  seller: "bg-brand/10 text-brand ring-brand/25",
  buyer: "bg-brand-red/10 text-brand-red ring-brand-red/25",
};

const DOT_STYLES: Record<string, string> = {
  approved: "bg-brand",
  active: "bg-brand",
  pending: "bg-amber-500",
  draft: "bg-black/35",
  rejected: "bg-brand-red",
  suspended: "bg-brand-red",
  sold: "bg-white",
  inactive: "bg-black/30",
  chat: "bg-brand",
  phone: "bg-brand-red",
  admin: "bg-white",
  seller: "bg-brand",
  buyer: "bg-brand-red",
};

export default function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset",
        STATUS_STYLES[key] || "bg-black/6 text-black/60 ring-black/12",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_STYLES[key] || "bg-black/35")} />
      {status}
    </span>
  );
}
