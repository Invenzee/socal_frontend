"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RiCloseLine, RiEqualizerLine, RiSortDesc } from "react-icons/ri";
import ListingsFilters from "@/components/listings/listings-filters";
import ListingCard from "@/components/listings/listing-card";
import type { Listing, PaginationMeta, TaxonomyItem } from "@/types/api";

gsap.registerPlugin(useGSAP);

const FILTER_KEYS = [
  "condition",
  "make",
  "category",
  "fuel",
  "transmission",
  "priceMin",
  "priceMax",
  "yearMin",
  "yearMax",
  "mileageMin",
  "mileageMax",
] as const;

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
  const drawerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = FILTER_KEYS.reduce((count, key) => {
    const value = searchParams.get(key);
    if (!value) return count;
    return count + value.split(",").filter(Boolean).length;
  }, 0);

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

  useGSAP(
    () => {
      const drawer = drawerRef.current;
      const overlay = overlayRef.current;
      if (!drawer || !overlay) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(overlay, { autoAlpha: filtersOpen ? 1 : 0 });
        gsap.set(drawer, { x: filtersOpen ? 0 : "-100%" });
        return;
      }
      gsap.to(overlay, { autoAlpha: filtersOpen ? 1 : 0, duration: 0.22, ease: "power2.out" });
      gsap.to(drawer, { x: filtersOpen ? 0 : "-100%", duration: 0.28, ease: "power3.out" });
    },
    { dependencies: [filtersOpen] },
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setFiltersOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

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

  const filterProps = {
    conditions: taxonomy.conditions,
    makes: taxonomy.makes,
    categories: taxonomy.categories,
    fuels: taxonomy.fuels,
    transmissions: taxonomy.transmissions,
  };

  return (
    <div ref={pageRef} className="mt-8 lg:mt-10">
      <div data-listings-header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-black sm:text-[28px]">{meta.total} vehicles available</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm lg:hidden"
          >
            <RiEqualizerLine className="size-5 text-brand" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand-red px-1.5 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <label className="inline-flex min-w-0 flex-1 items-center gap-3 rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm text-black shadow-sm sm:flex-none">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full bg-transparent outline-none sm:w-auto">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest</option>
            </select>
            <RiSortDesc className="size-5 shrink-0 text-brand" />
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-10 sm:mt-8 lg:flex-row lg:gap-12">
        <div data-listings-sidebar className="hidden lg:block">
          <ListingsFilters {...filterProps} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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

      <div className="lg:hidden">
        <button
          ref={overlayRef}
          type="button"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
          className="fixed inset-0 z-[60] bg-black/40"
          style={{ opacity: 0, pointerEvents: filtersOpen ? "auto" : "none" }}
        />
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal={filtersOpen}
          aria-hidden={!filtersOpen}
          aria-labelledby="mobile-filters-title"
          className="fixed inset-y-0 left-0 z-[61] flex w-[min(calc(100%-2.5rem),320px)] flex-col bg-white shadow-[8px_0_32px_rgba(0,0,0,0.18)]"
          style={{ transform: "translateX(-100%)", pointerEvents: filtersOpen ? "auto" : "none" }}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <h2 id="mobile-filters-title" className="text-lg font-semibold text-black">
              Filters
            </h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-black"
            >
              <RiCloseLine className="size-6" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
            {filtersOpen ? (
              <ListingsFilters {...filterProps} deferApply onApplied={() => setFiltersOpen(false)} />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
