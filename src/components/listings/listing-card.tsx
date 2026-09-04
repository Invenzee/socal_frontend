"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMileage, formatPrice } from "@/lib/api";
import type { Listing } from "@/types/api";

export default function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images.find((item) => item.isPrimary)?.url || listing.images[0]?.url || "/placeholder.svg";

  return (
    <article className="flex flex-col rounded-lg border border-black/8 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-5">
      <h3 className="text-base font-semibold text-black sm:text-lg">{listing.title}</h3>
      <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden bg-neutral-200">
        <Image src={image} alt={listing.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 280px" className="object-cover" />
      </div>
      <p className="mt-3 text-sm text-black/55">
        {listing.year} | {listing.fuel?.name || "Fuel"} | {formatMileage(listing.mileage)}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-black sm:text-[15px]">
          Listing Price <span className="font-semibold">{formatPrice(listing.price)}</span>
        </p>
        <Link
          href={`/listings/${listing.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-brand-red px-3.5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-[filter,transform] duration-200 hover:brightness-110 sm:px-4 sm:text-[13px]"
        >
          VIEW DETAILS
        </Link>
      </div>
    </article>
  );
}
