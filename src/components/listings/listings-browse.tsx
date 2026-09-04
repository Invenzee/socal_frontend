"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiSortDesc } from "react-icons/ri";
import ListingsFilters from "@/components/listings/listings-filters";
import ListingCard from "@/components/listings/listing-card";
import type { Listing, PaginationMeta, TaxonomyItem } from "@/types/api";

gsap.registerPlugin(useGSAP);

export default function ListingsBrowse({
  items,
  meta,
  taxonomy,
}: {
  items: Listing[];
  meta: PaginationMeta;
  taxonomy: {
    makes: TaxonomyItem[];
    conditions: TaxonomyItem[];
    categories: TaxonomyItem[];
    fuels: TaxonomyItem[];
    transmissions: TaxonomyItem[];
  };
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";

  useGSAP(
    () => {
      const page = pageRef.current;
      if (!page) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sidebar = page.querySelector("[data-listings-sidebar]");
      const header = page.querySelector("[data-listings-header]");
      const cards = page.querySelectorAll("[data-listing-card]");
      if (reduced) {
        gsap.set([sidebar, header, cards], { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo([sidebar, header], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 });
      gsap.fromTo(cards, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, delay: 0.15 });
    },
    { scope: pageRef, dependencies: [items.length] },
  );

  function setSort(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", next);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div ref={pageRef} className="mt-8 flex flex-col gap-10 lg:mt-10 lg:flex-row lg:gap-12">
      <div data-listings-sidebar>
        <ListingsFilters
          conditions={taxonomy.conditions}
          makes={taxonomy.makes}
          categories={taxonomy.categories}
          fuels={taxonomy.fuels}
          transmissions={taxonomy.transmissions}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div data-listings-header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-black sm:text-[28px]">{meta.total} vehicles available</h1>
          <label className="inline-flex items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm text-black shadow-sm">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest</option>
            </select>
            <RiSortDesc className="size-5 text-brand" />
          </label>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {items.map((listing) => (
            <div key={listing.id} data-listing-card>
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
        {items.length === 0 ? (
          <p className="mt-10 text-sm text-black/55">No approved listings match these filters yet.</p>
        ) : null}
        {meta.totalPages > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPage(page)}
                className={`size-9 rounded-md text-sm font-semibold ${page === meta.page ? "bg-brand text-white" : "bg-white text-black"}`}
              >
                {page}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
