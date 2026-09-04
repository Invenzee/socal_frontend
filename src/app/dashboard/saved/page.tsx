"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  RiCloseLine,
  RiDashboardHorizontalLine,
  RiHeartFill,
  RiHeartLine,
  RiListCheck2,
  RiSearchLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
import EmptyState from "@/components/dashboard/empty-state";
import { DashLinkButton } from "@/components/dashboard/dash-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { api, ApiRequestError, formatMileage, formatPrice } from "@/lib/api";
import type { Listing } from "@/types/api";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently saved" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "year_desc", label: "Newest year" },
];

export default function SavedPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    void api<{ items: Array<{ listing: Listing }> }>("/favorites")
      .then((data) => setItems(data.items.map((item) => item.listing).filter(Boolean)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? items.filter((item) =>
          [item.title, item.make?.name, item.model?.name]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term)),
        )
      : items;

    const sorted = [...filtered];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "year_desc") sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [items, search, sort]);

  async function unsave(listing: Listing) {
    const snapshot = items;
    setItems((prev) => prev.filter((item) => item.id !== listing.id));
    try {
      await api(`/favorites/${listing.id}`, { method: "DELETE" });
      toast.success("Removed from saved");
    } catch (error) {
      setItems(snapshot);
      toast.error(error instanceof ApiRequestError ? error.message : "Could not remove");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Buyer workspace"
        title="Saved trucks"
        description={`${items.length} truck${items.length === 1 ? "" : "s"} bookmarked for later.`}
        actions={
          <DashLinkButton href="/listings" variant="onBrand" icon={<RiSearchLine className="text-base" />}>
            Browse more
          </DashLinkButton>
        }
      />

      <div data-dash-reveal className="dash-panel flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex h-9 min-w-0 flex-1 items-center rounded-lg border border-black/10 bg-white shadow-xs transition-colors focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 hover:border-brand/40 lg:max-w-sm">
          <RiSearchLine className="pointer-events-none absolute left-3 text-base text-brand/70" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search saved trucks…"
            className="h-full w-full bg-transparent pr-9 pl-9 text-sm outline-none placeholder:text-black/35"
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2 grid size-5 cursor-pointer place-items-center rounded-full text-black/40 transition-colors hover:bg-brand-red/10 hover:text-brand-red"
            >
              <RiCloseLine />
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <DashSelect label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-56" />
          <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-white p-1">
            {(
              [
                { id: "grid", icon: <RiDashboardHorizontalLine />, label: "Grid view" },
                { id: "list", icon: <RiListCheck2 />, label: "List view" },
              ] as const
            ).map((option) => (
              <Tooltip key={option.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label={option.label}
                      aria-pressed={view === option.id}
                      onClick={() => setView(option.id)}
                      className={cn(
                        "grid size-7 cursor-pointer place-items-center rounded-md text-sm transition-colors",
                        view === option.id ? "bg-brand text-white" : "text-black/45 hover:bg-brand/8 hover:text-brand",
                      )}
                    >
                      {option.icon}
                    </button>
                  }
                />
                <TooltipContent className="bg-brand text-white">{option.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="dash-panel h-64 animate-pulse bg-white/60" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div data-dash-reveal className="dash-panel">
          <EmptyState
            icon={<RiHeartLine />}
            title={search ? "No saved trucks match that search" : "Nothing saved yet"}
            description={
              search
                ? "Try a different make, model or title."
                : "Tap the heart on any listing and it will show up here."
            }
            action={
              <DashLinkButton href="/listings" icon={<RiSearchLine className="text-base" />}>
                Browse trucks
              </DashLinkButton>
            }
          />
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((listing) => {
            const image = listing.images?.find((item) => item.isPrimary)?.url || listing.images?.[0]?.url;
            return (
              <article
                key={listing.id}
                data-dash-reveal
                className="dash-panel group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-200">
                  {image ? (
                    <Image
                      src={image}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-xs font-medium text-black/35">
                      Listing image
                    </span>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusPill status={listing.status} className="bg-white/95 backdrop-blur" />
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from saved"
                    onClick={() => void unsave(listing)}
                    className="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-full bg-white/95 text-brand-red shadow-sm backdrop-blur transition-transform hover:scale-110"
                  >
                    <RiHeartFill />
                  </button>
                </div>
                <div className="p-4">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="line-clamp-1 font-heading text-[15px] text-black transition-colors hover:text-brand"
                  >
                    {listing.title}
                  </Link>
                  <p className="mt-1 text-xs text-black/45">
                    {listing.year} · {listing.fuel?.name || "Fuel"} · {formatMileage(listing.mileage)}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                    <span className="text-lg font-semibold text-brand tabular-nums">{formatPrice(listing.price)}</span>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-brand-red px-3 text-xs font-semibold text-white transition-all hover:brightness-110"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div data-dash-reveal className="dash-panel divide-y divide-black/5 overflow-hidden">
          {visible.map((listing) => (
            <div key={listing.id} className="flex items-center gap-3 p-3 transition-colors hover:bg-brand/4 sm:p-4">
              <RowThumb
                name={listing.title}
                monogram={listing.make?.name}
                src={listing.images?.find((item) => item.isPrimary)?.url || listing.images?.[0]?.url}
                size={52}
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/listings/${listing.id}`}
                  className="block truncate font-semibold text-black transition-colors hover:text-brand"
                >
                  {listing.title}
                </Link>
                <p className="truncate text-xs text-black/45">
                  {listing.year} · {formatMileage(listing.mileage)} · {listing.make?.name} {listing.model?.name}
                </p>
              </div>
              <span className="hidden font-semibold text-brand tabular-nums sm:block">
                {formatPrice(listing.price)}
              </span>
              <div className="flex items-center gap-1.5">
                <ActionIcon label="View details" icon={<RiSearchLine />} href={`/listings/${listing.id}`} />
                <ActionIcon
                  label="Remove from saved"
                  icon={<RiHeartFill />}
                  tone="red"
                  onClick={() => void unsave(listing)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
