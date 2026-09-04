"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RiAddLine,
  RiCarLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiFileCopyLine,
  RiRefreshLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
import EmptyState from "@/components/dashboard/empty-state";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { DashButton, DashLinkButton } from "@/components/dashboard/dash-button";
import { api, ApiRequestError, formatMileage, formatPrice } from "@/lib/api";
import type { Listing, PaginationMeta } from "@/types/api";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
];

function primaryImage(listing: Listing) {
  return listing.images?.find((image) => image.isPrimary)?.url || listing.images?.[0]?.url || null;
}

export default function SellerListingsPage() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ ids: string[]; label: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  function changeStatus(value: string) {
    setLoading(true);
    setStatus(value);
    setPage(1);
  }

  function changeLimit(value: number) {
    setLoading(true);
    setLimit(value);
    setPage(1);
  }

  function changePage(value: number) {
    setLoading(true);
    setPage(value);
  }

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set("status", status);
      if (debounced.trim()) params.set("q", debounced.trim());
      const data = await api<{ items: Listing[]; meta: PaginationMeta }>(`/listings/mine?${params}`);
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

  async function removeListings(ids: string[]) {
    try {
      await Promise.all(ids.map((id) => api(`/listings/${id}`, { method: "DELETE" })));
      toast.success(ids.length === 1 ? "Listing deleted" : `${ids.length} listings deleted`);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Delete failed");
    }
  }

  function copyLink(id: string) {
    void navigator.clipboard
      .writeText(`${window.location.origin}/listings/${id}`)
      .then(() => toast.success("Listing link copied"))
      .catch(() => toast.error("Could not copy link"));
  }

  const columns: Array<Column<Listing>> = [
    {
      id: "title",
      header: "Truck",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <RowThumb name={row.title} monogram={row.make?.name} src={primaryImage(row)} size={44} />
          <div className="min-w-0">
            <Link
              href={`/listings/${row.id}`}
              className="block max-w-[22ch] truncate font-semibold text-black transition-colors hover:text-brand sm:max-w-[32ch]"
            >
              {row.title}
            </Link>
            <p className="truncate text-xs text-black/45">
              {row.year} · {row.make?.name} {row.model?.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: (row) => <span className="font-semibold text-brand tabular-nums">{formatPrice(row.price)}</span>,
    },
    {
      id: "mileage",
      header: "Mileage",
      hideBelow: "lg",
      cell: (row) => <span className="tabular-nums">{formatMileage(row.mileage)}</span>,
    },
    { id: "status", header: "Status", cell: (row) => <StatusPill status={row.status} /> },
    {
      id: "views",
      header: "Views",
      hideBelow: "md",
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-black/60 tabular-nums">
          <RiEyeLine className="text-brand" />
          {row.views}
        </span>
      ),
    },
    {
      id: "created",
      header: "Created",
      hideBelow: "xl",
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
        eyebrow="Seller workspace"
        title="My listings"
        description="Search, filter and manage every truck you have on the marketplace."
        actions={
          <>
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
            <DashLinkButton href="/sell" variant="onBrand" icon={<RiAddLine className="text-base" />}>
              New listing
            </DashLinkButton>
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowId={(row) => row.id}
        loading={loading}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          placeholder: "Search by title…",
        }}
        filters={
          <DashSelect label="Status" value={status} onChange={changeStatus} options={STATUS_OPTIONS} className="w-44" />
        }
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={(ids) => (
          <DashButton
            variant="onBrand"
            size="sm"
            icon={<RiDeleteBin6Line className="text-sm" />}
            onClick={() => setConfirm({ ids, label: `${ids.length} listing${ids.length === 1 ? "" : "s"}` })}
          >
            Delete selected
          </DashButton>
        )}
        rowActions={(row) => (
          <>
            <ActionIcon label="View listing" icon={<RiEyeLine />} href={`/listings/${row.id}`} />
            <ActionIcon label="Copy link" icon={<RiFileCopyLine />} tone="neutral" onClick={() => copyLink(row.id)} />
            <ActionIcon
              label="Delete listing"
              icon={<RiDeleteBin6Line />}
              tone="red"
              onClick={() => setConfirm({ ids: [row.id], label: row.title })}
            />
          </>
        )}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={meta.limit}
        onPageChange={changePage}
        onLimitChange={changeLimit}
        empty={
          <EmptyState
            icon={<RiCarLine />}
            title={search || status ? "No listings match those filters" : "No listings yet"}
            description={
              search || status
                ? "Try a different search term or clear the status filter."
                : "Publish your first truck and start collecting buyer leads."
            }
            action={
              search || status ? (
                <DashButton
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                  }}
                >
                  Clear filters
                </DashButton>
              ) : (
                <DashLinkButton href="/sell" icon={<RiAddLine className="text-base" />}>
                  Create listing
                </DashLinkButton>
              )
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Delete listing?"
        description={`${confirm?.label ?? "This listing"} will be permanently removed from the marketplace. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirm) void removeListings(confirm.ids);
        }}
      />
    </div>
  );
}
