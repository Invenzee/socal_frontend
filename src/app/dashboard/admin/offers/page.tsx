"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiFlagLine,
  RiHandCoinLine,
  RiMailSendLine,
  RiPhoneLine,
  RiPriceTag3Line,
  RiRefreshLine,
  RiUserVoiceLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import EmptyState from "@/components/dashboard/empty-state";
import ConfirmDialog from "@/components/dashboard/confirm-dialog";
import { DashButton } from "@/components/dashboard/dash-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const STATUS_META: Record<
  OfferStatus,
  { label: string; icon: typeof RiFlagLine; className: string }
> = {
  new: { label: "New", icon: RiFlagLine, className: "text-brand hover:bg-brand hover:text-white" },
  contacted: { label: "Contacted", icon: RiUserVoiceLine, className: "text-brand hover:bg-brand hover:text-white" },
  offered: { label: "Offered", icon: RiPriceTag3Line, className: "text-brand-red hover:bg-brand-red hover:text-white" },
  won: { label: "Won", icon: RiCheckboxCircleLine, className: "text-brand hover:bg-brand hover:text-white" },
  lost: { label: "Lost", icon: RiCloseCircleLine, className: "text-brand-red hover:bg-brand-red hover:text-white" },
};

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
  const [viewTarget, setViewTarget] = useState<OfferLead | null>(null);
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
      id: "phone",
      header: "Phone",
      cell: (row) =>
        row.phone ? (
          <a href={`tel:${row.phone}`} className="font-semibold tabular-nums text-brand hover:text-brand-red">
            {row.phone}
          </a>
        ) : (
          <span>—</span>
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
        </div>
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
          placeholder: "Search name, email, phone, or plate…",
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
        rowActions={(row) => {
          const meta = STATUS_META[row.status];
          const StatusIcon = meta.icon;
          return (
            <>
              <ActionIcon label="View details" icon={<RiEyeLine />} onClick={() => setViewTarget(row)} />
              {row.phone ? (
                <ActionIcon label="Call" icon={<RiPhoneLine />} tone="red" href={`tel:${row.phone}`} />
              ) : null}
              <ActionIcon label="Send offer" icon={<RiMailSendLine />} onClick={() => setEmailTarget(row)} />
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <DropdownMenuTrigger
                        render={
                          <button
                            type="button"
                            aria-label={`Status: ${meta.label}`}
                            className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-black/8 bg-white text-[15px] shadow-xs transition-all duration-150 hover:-translate-y-px hover:border-transparent ${meta.className}`}
                          >
                            <StatusIcon />
                          </button>
                        }
                      />
                    }
                  />
                  <TooltipContent className="bg-brand text-white">Status: {meta.label}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Change status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={row.status}
                    onValueChange={(value) => void patchStatus(row.id, value as OfferStatus)}
                  >
                    {(Object.keys(STATUS_META) as OfferStatus[]).map((value) => (
                      <DropdownMenuRadioItem key={value} value={value} className="cursor-pointer">
                        {STATUS_META[value].label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <ActionIcon label="Delete lead" icon={<RiDeleteBin6Line />} tone="red" onClick={() => setConfirmId(row.id)} />
            </>
          );
        }}
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
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
      >
        <DialogContent className="max-w-lg border-black/10 bg-white sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-black">Offer lead</DialogTitle>
            <DialogDescription className="text-sm text-black/60">
              {viewTarget ? `${viewTarget.fullName} · ${STATUS_META[viewTarget.status].label}` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewTarget ? (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Detail label="Email" value={viewTarget.email} />
              <Detail
                label="Phone"
                value={
                  viewTarget.phone ? (
                    <a href={`tel:${viewTarget.phone}`} className="font-semibold text-brand hover:text-brand-red">
                      {viewTarget.phone}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Detail
                label="Vehicle"
                value={`${viewTarget.year} ${taxName(viewTarget.make)} ${taxName(viewTarget.model)}`}
              />
              <Detail label="Condition" value={taxName(viewTarget.condition)} />
              <Detail label="License plate" value={viewTarget.licensePlate || "—"} />
              <Detail label="Mileage" value={`${viewTarget.mileage.toLocaleString("en-US")} mi`} />
              <Detail label="Location" value={`${viewTarget.city}, ${viewTarget.zip}`} />
              <Detail label="Last offer" value={viewTarget.offerPrice ? formatPrice(viewTarget.offerPrice) : "—"} />
              <Detail
                label="Received"
                value={
                  viewTarget.createdAt
                    ? new Date(viewTarget.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              {viewTarget.offerMessage ? (
                <div className="sm:col-span-2">
                  <Detail label="Offer message" value={viewTarget.offerMessage} />
                </div>
              ) : null}
            </dl>
          ) : null}
          <DialogFooter className="border-0 bg-transparent">
            {viewTarget?.phone ? (
              <a
                href={`tel:${viewTarget.phone}`}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-brand-red px-3 text-sm font-medium text-white hover:bg-brand-red/90"
              >
                Call
              </a>
            ) : null}
            <Button
              type="button"
              className="bg-brand text-white hover:bg-brand/90"
              onClick={() => {
                if (!viewTarget) return;
                setEmailTarget(viewTarget);
                setViewTarget(null);
              }}
            >
              Send offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-[0.12em] text-black/40 uppercase">{label}</dt>
      <dd className="mt-1 truncate font-medium text-black">{value}</dd>
    </div>
  );
}
