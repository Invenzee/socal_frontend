"use client";

import Link from "next/link";
import { formatMileage, formatPrice } from "@/lib/api";
import type { Listing } from "@/types/api";
import { ListingPhotoButton, orderedPhotos } from "@/components/listings/photo-lightbox";

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = orderedPhotos(listing.images)[0];

  return (
    <article className="flex flex-col rounded-lg border border-black/8 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-5">
      <h3 className="text-base font-semibold text-black sm:text-lg">{listing.title}</h3>
      <ListingPhotoButton images={listing.images} title={listing.title} className="relative mt-3 block aspect-[16/10] w-full cursor-zoom-in overflow-hidden bg-neutral-200">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={listing.title} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-xs font-medium text-black/40">No photo</span>
        )}
      </ListingPhotoButton>
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
