"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  RiCheckboxCircleLine,
  RiForbid2Line,
  RiGroupLine,
  RiMailLine,
  RiRefreshLine,
  RiUserSettingsLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
import RowThumb from "@/components/dashboard/row-thumb";
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
import { api, ApiRequestError } from "@/lib/api";
import type { AdminUser, PaginationMeta, UserRole } from "@/types/api";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "seller", label: "Seller" },
  { value: "buyer", label: "Buyer" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ ids: string[]; next: "active" | "suspended" } | null>(null);

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
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      if (debounced.trim()) params.set("q", debounced.trim());
      const data = await api<{ items: AdminUser[]; meta: PaginationMeta }>(`/admin/users?${params}`);
      setRows(data.items);
      setMeta(data.meta);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, status, debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(ids: string[], body: Record<string, string>, successMessage: string) {
    try {
      await Promise.all(ids.map((id) => api(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) })));
      toast.success(successMessage);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Update failed");
    }
  }

  const columns: Array<Column<AdminUser>> = [
    {
      id: "user",
      header: "Member",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <RowThumb name={row.fullName} shape="circle" size={38} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-black">{row.fullName}</p>
            <p className="truncate text-xs text-black/45">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      hideBelow: "lg",
      cell: (row) => <span className="tabular-nums">{row.phone || "—"}</span>,
    },
    { id: "role", header: "Role", cell: (row) => <StatusPill status={row.role} /> },
    { id: "status", header: "Status", cell: (row) => <StatusPill status={row.status} /> },
    {
      id: "verified",
      header: "Email",
      hideBelow: "md",
      cell: (row) =>
        row.emailVerifiedAt ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand">
            <RiCheckboxCircleLine /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-black/40">
            <RiForbid2Line /> Unverified
          </span>
        ),
    },
    {
      id: "joined",
      header: "Joined",
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
        title="Members"
        description="Search the member base, change roles and suspend problem accounts."
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
          placeholder: "Search name or email…",
        }}
        filters={
          <>
            <DashSelect
              label="Role"
              value={role}
              onChange={(value) => changeFilter(() => setRole(value))}
              options={ROLE_OPTIONS}
              className="w-40"
            />
            <DashSelect
              label="Status"
              value={status}
              onChange={(value) => changeFilter(() => setStatus(value))}
              options={STATUS_OPTIONS}
              className="w-44"
            />
          </>
        }
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        bulkActions={(ids) => (
          <>
            <DashButton
              variant="onBrand"
              size="sm"
              icon={<RiCheckboxCircleLine className="text-sm" />}
              onClick={() => void patch(ids, { status: "active" }, `${ids.length} accounts activated`)}
            >
              Activate
            </DashButton>
            <DashButton
              variant="red"
              size="sm"
              icon={<RiForbid2Line className="text-sm" />}
              onClick={() => setConfirm({ ids, next: "suspended" })}
            >
              Suspend
            </DashButton>
          </>
        )}
        rowActions={(row) => (
          <>
            <ActionIcon label="Email member" icon={<RiMailLine />} tone="neutral" href={`mailto:${row.email}`} />
            {row.role === "admin" ? null : (
              <>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label="Change role"
                              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-black/8 bg-white text-[15px] text-brand shadow-xs transition-all duration-150 hover:-translate-y-px hover:border-transparent hover:bg-brand hover:text-white"
                            >
                              <RiUserSettingsLine />
                            </button>
                          }
                        />
                      }
                    />
                    <TooltipContent className="bg-brand text-white">Change role</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Change role</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={row.role}
                      onValueChange={(value) =>
                        void patch([row.id], { role: value as UserRole }, `${row.fullName} is now ${value}`)
                      }
                    >
                      <DropdownMenuRadioItem value="buyer" className="cursor-pointer">
                        Buyer
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="seller" className="cursor-pointer">
                        Seller
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="admin" className="cursor-pointer">
                        Admin
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                {row.status === "active" ? (
                  <ActionIcon
                    label="Suspend account"
                    icon={<RiForbid2Line />}
                    tone="red"
                    onClick={() => setConfirm({ ids: [row.id], next: "suspended" })}
                  />
                ) : (
                  <ActionIcon
                    label="Activate account"
                    icon={<RiCheckboxCircleLine />}
                    onClick={() => void patch([row.id], { status: "active" }, `${row.fullName} activated`)}
                  />
                )}
              </>
            )}
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
            icon={<RiGroupLine />}
            title="No members match those filters"
            description="Try a different search term, role or status."
            action={
              <DashButton
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRole("");
                  setStatus("");
                }}
              >
                Clear filters
              </DashButton>
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Suspend account?"
        description={
          confirm && confirm.ids.length > 1
            ? `${confirm.ids.length} members will lose access until you reactivate them.`
            : "This member will lose access until you reactivate the account."
        }
        confirmLabel="Suspend"
        onConfirm={() => {
          if (confirm) {
            void patch(
              confirm.ids,
              { status: confirm.next },
              confirm.ids.length > 1 ? `${confirm.ids.length} accounts suspended` : "Account suspended",
            );
          }
        }}
      />
    </div>
  );
}
