"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RiCheckLine,
  RiCloseCircleLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiRefreshLine,
  RiCarLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
import EmptyState from "@/components/dashboard/empty-state";
import { DashButton } from "@/components/dashboard/dash-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiRequestError, formatMileage, formatPrice } from "@/lib/api";
import type { Listing, PaginationMeta } from "@/types/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All listings" },
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "sold", label: "Sold" },
];

const QUICK_REASONS = [
  "Photos are too low quality to verify the vehicle.",
  "Listing details are incomplete or inconsistent.",
  "Pricing looks inaccurate for the described vehicle.",
  "Does not meet listing guidelines.",
];

function primaryImage(listing: Listing) {
  return listing.images?.find((image) => image.isPrimary)?.url || listing.images?.[0]?.url || null;
}

export default function AdminListingsPage() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [review, setReview] = useState<Listing | null>(null);
  const [rejecting, setRejecting] = useState<{ ids: string[]; label: string } | null>(null);
  const [reason, setReason] = useState(QUICK_REASONS[3]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  function changeFilter(apply: () => void) {
    setLoading(true);
    apply();
    setPage(1);
  }

  function changePage(value: number) {
    setLoading(true);
    setPage(value);
  }

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status && status !== "all") params.set("status", status);
      if (debounced.trim()) params.set("q", debounced.trim());
      const data = await api<{ items: Listing[]; meta: PaginationMeta }>(`/admin/listings?${params}`);
      setRows(data.items);
      setMeta(data.meta);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => api(`/admin/listings/${id}/approve`, { method: "POST" })));
      toast.success(ids.length === 1 ? "Listing approved" : `${ids.length} listings approved`);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      setReview(null);
      if (status === "pending") {
        changeFilter(() => setStatus("all"));
        return;
      }
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Approve failed");
    }
  }

  async function reject(ids: string[]) {
    const text = reason.trim() || QUICK_REASONS[3];
    try {
      await Promise.all(
        ids.map((id) =>
          api(`/admin/listings/${id}/reject`, { method: "POST", body: JSON.stringify({ reason: text }) }),
        ),
      );
      toast.success(ids.length === 1 ? "Listing rejected" : `${ids.length} listings rejected`);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      setRejecting(null);
      setReview(null);
      if (status === "pending") {
        changeFilter(() => setStatus("all"));
        return;
      }
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Reject failed");
    }
  }

  const columns: Array<Column<Listing>> = [
    {
      id: "title",
      header: "Listing",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <RowThumb name={row.title} monogram={row.make?.name} src={primaryImage(row)} size={44} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setReview(row)}
              className="block max-w-[24ch] cursor-pointer truncate text-left font-semibold text-black transition-colors hover:text-brand sm:max-w-[32ch]"
            >
              {row.title}
            </button>
            <p className="truncate text-xs text-black/45">
              {row.year} · {row.make?.name} {row.model?.name} · {formatMileage(row.mileage)}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "seller",
      header: "Seller",
      hideBelow: "md",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <RowThumb name={row.seller?.fullName || "Seller"} shape="circle" size={28} />
          <span className="truncate text-sm">{row.seller?.fullName || "Unknown"}</span>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: (row) => <span className="font-semibold text-brand tabular-nums">{formatPrice(row.price)}</span>,
    },
    { id: "status", header: "Status", cell: (row) => <StatusPill status={row.status} /> },
    {
      id: "submitted",
      header: "Submitted",
      hideBelow: "lg",
      cell: (row) => (
        <span className="text-xs text-black/50">
          {new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Listings"
        description="Review, approve, and filter every listing on the marketplace."
        actions={
          <DashButton
            variant="onBrandGhost"
            icon={<RiRefreshLine className="text-base" />}
            onClick={() => {
              setLoading(true);
              void load();
            }}
          >
            Refresh
          </DashButton>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowId={(row) => row.id || ""}
        loading={loading}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          placeholder: "Search listings…",
        }}
        filters={
          <DashSelect
            label="Status"
            value={status}
            onChange={(value) => changeFilter(() => setStatus(value))}
            options={STATUS_OPTIONS}
            className="w-52"
          />
        }
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={(ids) => (
          <>
            <DashButton
              variant="onBrand"
              size="sm"
              icon={<RiCheckLine className="text-sm" />}
              onClick={() => void approve(ids)}
            >
              Approve
            </DashButton>
            <DashButton
              variant="red"
              size="sm"
              icon={<RiCloseCircleLine className="text-sm" />}
              onClick={() => setRejecting({ ids, label: `${ids.length} listing${ids.length === 1 ? "" : "s"}` })}
            >
              Reject
            </DashButton>
          </>
        )}
        rowActions={(row) => (
          <>
            <ActionIcon label="Review details" icon={<RiEyeLine />} tone="neutral" onClick={() => setReview(row)} />
            {row.status !== "approved" ? (
              <ActionIcon label="Approve listing" icon={<RiCheckLine />} onClick={() => void approve([row.id])} />
            ) : null}
            {row.status !== "rejected" ? (
              <ActionIcon
                label="Reject listing"
                icon={<RiCloseCircleLine />}
                tone="red"
                onClick={() => setRejecting({ ids: [row.id], label: row.title })}
              />
            ) : null}
          </>
        )}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={meta.limit}
        onPageChange={changePage}
        onLimitChange={(value) => changeFilter(() => setLimit(value))}
        empty={
          <EmptyState
            icon={<RiCarLine />}
            title={status === "pending" ? "Queue is clear" : "No listings found"}
            description={
              status === "pending"
                ? "Every submitted listing has been reviewed. Switch the filter to All listings to see approved ones."
                : "Try a different status filter or search term."
            }
          />
        }
      />

      <Dialog open={Boolean(review)} onOpenChange={(open) => !open && setReview(null)}>
        <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {review ? (
            <>
              <div className="relative aspect-[16/8] w-full bg-neutral-200">
                {primaryImage(review) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage(review) as string}
                    alt={review.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-xs font-medium text-black/35">
                    Listing image
                  </span>
                )}
                <div className="absolute top-3 left-3">
                  <StatusPill status={review.status} className="bg-white/95 backdrop-blur" />
                </div>
              </div>
              <div className="p-5">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-heading text-xl">{review.title}</DialogTitle>
                  <DialogDescription>
                    Submitted by {review.seller?.fullName || "Unknown seller"} on{" "}
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Price", value: formatPrice(review.price) },
                    { label: "Year", value: String(review.year) },
                    { label: "Mileage", value: formatMileage(review.mileage) },
                    { label: "Condition", value: review.condition?.name || "—" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-brand/6 p-3">
                      <p className="text-[10px] font-semibold tracking-[0.12em] text-brand uppercase">{item.label}</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-black">{item.value}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 max-h-32 overflow-y-auto text-sm leading-relaxed text-black/65">
                  {review.description}
                </p>

                {review.images?.length > 1 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {review.images.slice(0, 8).map((image) => (
                      <span
                        key={image.publicId}
                        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt="" className="size-full object-cover" />
                      </span>
                    ))}
                  </div>
                ) : null}

                <DialogFooter className="mt-5 flex-wrap gap-2">
                  <Link
                    href={`/listings/${review.id}`}
                    target="_blank"
                    className="mr-auto inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/8"
                  >
                    <RiExternalLinkLine /> Open public page
                  </Link>
                  <DashButton variant="outline" onClick={() => setReview(null)}>
                    Close
                  </DashButton>
                  <DashButton
                    variant="danger"
                    icon={<RiCloseCircleLine className="text-base" />}
                    onClick={() => setRejecting({ ids: [review.id], label: review.title })}
                  >
                    Reject
                  </DashButton>
                  <DashButton icon={<RiCheckLine className="text-base" />} onClick={() => void approve([review.id])}>
                    Approve
                  </DashButton>
                </DialogFooter>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-lg">Reject {rejecting?.label}</DialogTitle>
            <DialogDescription>The seller receives this reason by email, so keep it specific.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    reason === item
                      ? "bg-brand text-white"
                      : "bg-brand/8 text-brand hover:bg-brand/15"
                  }`}
                >
                  {item.split(" ").slice(0, 3).join(" ")}…
                </button>
              ))}
            </div>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-black/10 bg-white p-3 text-sm outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
            />
            <p className="text-right text-[11px] text-black/35">{reason.length}/500</p>
          </div>
          <DialogFooter>
            <DashButton variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </DashButton>
            <DashButton
              variant="red"
              icon={<RiCloseCircleLine className="text-base" />}
              disabled={reason.trim().length < 3}
              onClick={() => rejecting && void reject(rejecting.ids)}
            >
              Send rejection
            </DashButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
