"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const RING = [
  "from-[#014BAD] to-[#0367e0]",
  "from-[#FF3232] to-[#ff6b6b]",
  "from-[#013A86] to-[#014BAD]",
  "from-[#111111] to-[#3a3a3a]",
];

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function hashIndex(value: string, buckets: number) {
  let sum = 0;
  for (let i = 0; i < value.length; i += 1) sum = (sum + value.charCodeAt(i)) % 9973;
  return sum % buckets;
}

type RowThumbProps = {
  name: string;
  src?: string | null;
  /** Text the monogram is derived from when there is no image (defaults to `name`). */
  monogram?: string;
  /** `square` for listings/vehicles, `circle` for people. */
  shape?: "square" | "circle";
  size?: number;
  className?: string;
};

/** Logo tile used in table rows: real image when we have one, branded monogram otherwise. */
export default function RowThumb({
  name,
  src,
  monogram,
  shape = "square",
  size = 40,
  className,
}: RowThumbProps) {
  const label = monogram || name;
  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

  if (src) {
    return (
      <span
        className={cn("relative block shrink-0 overflow-hidden bg-neutral-200 ring-1 ring-black/8", radius, className)}
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-to-br font-semibold text-white ring-1 ring-black/8",
        RING[hashIndex(label || "?", RING.length)],
        radius,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {initials(label) || "?"}
    </span>
  );
}
