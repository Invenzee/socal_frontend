"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RiMailLine, RiPhoneLine, RiRefreshLine, RiUserStarLine, RiEyeLine } from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
import EmptyState from "@/components/dashboard/empty-state";
import { DashButton } from "@/components/dashboard/dash-button";
import { api } from "@/lib/api";
import type { Lead, PaginationMeta } from "@/types/api";

const TYPE_OPTIONS = [
  { value: "", label: "All lead types" },
  { value: "chat", label: "Chat" },
  { value: "phone", label: "Phone reveal" },
];

function relative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SellerLeadsPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
      if (type) params.set("type", type);
      const data = await api<{ items: Lead[]; meta: PaginationMeta }>(`/listings/leads?${params}`);
      setRows(data.items);
      setMeta(data.meta);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.buyer?.fullName, row.buyer?.email, row.listing?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [rows, search]);

  const columns: Array<Column<Lead>> = [
    {
      id: "buyer",
      header: "Buyer",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <RowThumb name={row.buyer?.fullName || "Buyer"} shape="circle" size={38} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-black">{row.buyer?.fullName || "Unknown buyer"}</p>
            <p className="truncate text-xs text-black/45">{row.buyer?.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "listing",
      header: "Listing",
      cell: (row) =>
        row.listing?.id ? (
          <Link
            href={`/listings/${row.listing.id}`}
            className="block max-w-[28ch] truncate font-medium text-brand transition-colors hover:text-brand-red"
          >
            {row.listing.title}
          </Link>
        ) : (
          <span className="text-black/40">{row.listing?.title || "—"}</span>
        ),
    },
    { id: "type", header: "Source", cell: (row) => <StatusPill status={row.type} /> },
    {
      id: "phone",
      header: "Phone",
      hideBelow: "lg",
      cell: (row) => <span className="tabular-nums">{row.buyer?.phone || "—"}</span>,
    },
    {
      id: "created",
      header: "Received",
      hideBelow: "sm",
      cell: (row) => <span className="text-xs text-black/50">{relative(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Seller workspace"
        title="Leads"
        description="Every buyer who started a chat or revealed your number, newest first."
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
        rows={visible}
        rowId={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Filter buyers on this page…" }}
        filters={
          <DashSelect
            label="Type"
            value={type}
            onChange={(value) => changeFilter(() => setType(value))}
            options={TYPE_OPTIONS}
            className="w-48"
          />
        }
        rowActions={(row) => (
          <>
            {row.buyer?.email ? (
              <ActionIcon label="Email buyer" icon={<RiMailLine />} href={`mailto:${row.buyer.email}`} />
            ) : null}
            {row.buyer?.phone ? (
              <ActionIcon label="Call buyer" icon={<RiPhoneLine />} tone="red" href={`tel:${row.buyer.phone}`} />
            ) : null}
            {row.listing?.id ? (
              <ActionIcon
                label="View listing"
                icon={<RiEyeLine />}
                tone="neutral"
                href={`/listings/${row.listing.id}`}
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
            icon={<RiUserStarLine />}
            title={search ? "No leads match that search" : "No leads yet"}
            description={
              search
                ? "Try a different name, email or listing title."
                : "Leads appear here the moment a buyer messages you or reveals your phone number."
            }
          />
        }
      />
    </div>
  );
}
