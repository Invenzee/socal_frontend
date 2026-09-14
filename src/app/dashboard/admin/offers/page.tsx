"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RiDeleteBin6Line,
  RiFileCopyLine,
  RiHandCoinLine,
  RiMailLine,
  RiMailSendLine,
  RiRefreshLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import EmptyState from "@/components/dashboard/empty-state";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { DashButton } from "@/components/dashboard/dash-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api, ApiRequestError, formatPrice } from "@/lib/api";
import type { OfferLead, OfferStatus, PaginationMeta, TaxonomyItem } from "@/types/api";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "offered", label: "Offered" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const ROW_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value);

function taxName(value?: TaxonomyItem | string) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.name || "—";
}

export default function AdminOffersPage() {
  const [rows, setRows] = useState<OfferLead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState<OfferLead | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  function changeFilter(apply: () => void) {
    setLoading(true);
    apply();
    setPage(1);
  }

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set("status", status);
      if (debounced.trim()) params.set("q", debounced.trim());
      const data = await api<{ items: OfferLead[]; meta: PaginationMeta }>(`/admin/offers?${params}`);
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

  async function patchStatus(id: string, next: OfferStatus) {
    try {
      await api(`/admin/offers/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      toast.success("Status updated");
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Update failed");
    }
  }

  async function removeOffer(id: string) {
    try {
      await api(`/admin/offers/${id}`, { method: "DELETE" });
      toast.success("Offer lead deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Delete failed");
    }
  }

  async function sendOffer() {
    if (!emailTarget) return;
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid offer price.");
      return;
    }
    setSending(true);
    try {
      await api(`/admin/offers/${emailTarget.id}/email`, {
        method: "POST",
        body: JSON.stringify({ price: amount, message: message.trim() }),
      });
      toast.success(`Offer emailed to ${emailTarget.fullName}`);
      setEmailTarget(null);
      setPrice("");
      setMessage("");
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not send email");
    } finally {
      setSending(false);
    }
  }

  function copyEmail(email: string) {
    void navigator.clipboard.writeText(email).then(
      () => toast.success("Email copied"),
      () => toast.error("Could not copy email"),
    );
  }

  const columns: Array<Column<OfferLead>> = [
    {
      id: "seller",
      header: "Seller",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-black">{row.fullName}</p>
          <p className="truncate text-xs text-black/45">{row.email}</p>
        </div>
      ),
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-black">
            {row.year} {taxName(row.make)} {taxName(row.model)}
          </p>
          <p className="truncate text-xs text-black/45">
            {row.licensePlate} · {row.mileage.toLocaleString("en-US")} mi
          </p>
        </div>
      ),
    },
    {
      id: "location",
      header: "Location",
      hideBelow: "lg",
      cell: (row) => (
        <span className="text-sm">
          {row.city}, {row.zip}
        </span>
      ),
    },
    { id: "status", header: "Status", cell: (row) => <StatusPill status={row.status} /> },
    {
      id: "offer",
      header: "Last offer",
      hideBelow: "md",
      cell: (row) => <span className="tabular-nums">{row.offerPrice ? formatPrice(row.offerPrice) : "—"}</span>,
    },
    {
      id: "received",
      header: "Received",
      hideBelow: "xl",
      cell: (row) => (
        <span className="text-xs text-black/50">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Offer leads"
        description="Review guest Get an Offer requests and email a price when you want to move forward."
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
        rowId={(row) => row.id}
        loading={loading}
        search={{
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          placeholder: "Search name, email, or plate…",
        }}
        filters={
          <DashSelect
            label="Status"
            value={status}
            onChange={(value) => changeFilter(() => setStatus(value))}
            options={STATUS_OPTIONS}
            className="w-44"
          />
        }
        rowActions={(row) => (
          <>
            <ActionIcon label="Email seller" icon={<RiMailLine />} tone="neutral" href={`mailto:${row.email}`} />
            <ActionIcon label="Copy email" icon={<RiFileCopyLine />} tone="neutral" onClick={() => copyEmail(row.email)} />
            <ActionIcon label="Send offer" icon={<RiMailSendLine />} onClick={() => setEmailTarget(row)} />
            <DashSelect
              ariaLabel="Change status"
              value={row.status}
              onChange={(value) => void patchStatus(row.id, value as OfferStatus)}
              options={ROW_STATUS_OPTIONS}
              className="h-8 w-[132px]"
            />
            <ActionIcon label="Delete lead" icon={<RiDeleteBin6Line />} tone="red" onClick={() => setConfirmId(row.id)} />
          </>
        )}
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        limit={meta.limit}
        onPageChange={(value) => {
          setLoading(true);
          setPage(value);
        }}
        onLimitChange={(value) => changeFilter(() => setLimit(value))}
        empty={
          <EmptyState
            icon={<RiHandCoinLine />}
            title="No offer leads yet"
            description="Guest Get an Offer submissions will show up here."
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete offer lead?"
        description="This request will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmId) void removeOffer(confirmId);
        }}
      />

      <Dialog
        open={Boolean(emailTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setEmailTarget(null);
            setPrice("");
            setMessage("");
          }
        }}
      >
        <DialogContent className="max-w-md border-black/10 bg-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-black">Send offer email</DialogTitle>
            <DialogDescription className="text-sm text-black/60">
              {emailTarget
                ? `${emailTarget.year} ${taxName(emailTarget.make)} ${taxName(emailTarget.model)} · ${emailTarget.fullName}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="offer-price">Offer price (USD)</Label>
              <Input
                id="offer-price"
                type="number"
                min={1}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-message">Message (optional)</Label>
              <Textarea
                id="offer-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="We can pick up this week if you accept."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="border-0 bg-transparent">
            <Button type="button" variant="outline" onClick={() => setEmailTarget(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-brand text-white hover:bg-brand/90" disabled={sending} onClick={() => void sendOffer()}>
              {sending ? "Sending..." : "Send email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
