"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  RiAddLine,
  RiCarLine,
  RiCheckboxCircleLine,
  RiForbid2Line,
  RiGasStationLine,
  RiListSettingsLine,
  RiPencilLine,
  RiPriceTag3Line,
  RiSettings3Line,
  RiSparkling2Line,
  RiStackLine,
  RiSteering2Line,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import DataTable, { type Column } from "@/components/dashboard/data-table";
import DashSelect from "@/components/dashboard/dash-select";
import ActionIcon from "@/components/dashboard/action-icon";
import StatusPill from "@/components/dashboard/status-pill";
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
import { api, ApiRequestError } from "@/lib/api";
import type { TaxonomyItem } from "@/types/api";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "makes", label: "Makes", path: "/taxonomy/makes", icon: RiPriceTag3Line },
  { id: "models", label: "Models", path: "/taxonomy/models", icon: RiCarLine },
  { id: "categories", label: "Categories", path: "/taxonomy/categories", icon: RiStackLine },
  { id: "conditions", label: "Conditions", path: "/taxonomy/conditions", icon: RiSettings3Line },
  { id: "fuels", label: "Fuel types", path: "/taxonomy/fuels", icon: RiGasStationLine },
  { id: "transmissions", label: "Transmissions", path: "/taxonomy/transmissions", icon: RiSteering2Line },
  { id: "features", label: "Features", path: "/taxonomy/features", icon: RiSparkling2Line },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PAGE_SIZE = 10;

export default function TaxonomyPage() {
  const [tab, setTab] = useState<TabId>("makes");
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [makes, setMakes] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string[]>([]);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [make, setMake] = useState("");
  const [renaming, setRenaming] = useState<TaxonomyItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const current = TABS.find((item) => item.id === tab)!;

  const load = useCallback(async () => {
    const target = TABS.find((item) => item.id === tab)!;
    try {
      const data = await api<{ items: TaxonomyItem[] }>(`${target.path}?includeInactive=true`);
      setItems(data.items);
      if (target.id === "models" && makes.length === 0) {
        const makeData = await api<{ items: TaxonomyItem[] }>("/taxonomy/makes?includeInactive=true");
        setMakes(makeData.items);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, makes.length]);

  useEffect(() => {
    void load();
  }, [load]);

  function changeTab(next: TabId) {
    setLoading(true);
    setTab(next);
    setPage(1);
    setSelected([]);
    setSearch("");
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(term));
  }, [items, search]);

  const paged = useMemo(() => filtered.slice((page - 1) * limit, page * limit), [filtered, page, limit]);

  async function create() {
    if (!name.trim()) return;
    try {
      await api(current.path, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), make: tab === "models" ? make || undefined : undefined }),
      });
      toast.success(`${name.trim()} added`);
      setName("");
      setAdding(false);
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Create failed");
    }
  }

  async function patch(ids: string[], body: Record<string, unknown>, message: string) {
    try {
      await Promise.all(ids.map((id) => api(`${current.path}/${id}`, { method: "PATCH", body: JSON.stringify(body) })));
      toast.success(message);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      await load();
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Update failed");
    }
  }

  const columns: Array<Column<TaxonomyItem>> = [
    {
      id: "name",
      header: "Option",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg text-base",
              row.isActive ? "bg-brand/10 text-brand" : "bg-black/5 text-black/35",
            )}
          >
            <current.icon />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-black">{row.name}</p>
            <p className="truncate font-mono text-xs text-black/40">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Visibility",
      cell: (row) => <StatusPill status={row.isActive ? "active" : "inactive"} />,
    },
    {
      id: "sort",
      header: "Order",
      hideBelow: "md",
      cell: (row) => <span className="text-black/50 tabular-nums">{row.sortOrder}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Taxonomy"
        description="The dropdown options sellers pick from when they list a truck."
        actions={
          <DashButton variant="onBrand" icon={<RiAddLine className="text-base" />} onClick={() => setAdding(true)}>
            Add {current.label.toLowerCase().replace(/s$/, "")}
          </DashButton>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
        <nav data-dash-reveal className="dash-panel h-fit p-2">
          <p className="px-2 py-2 text-[10px] font-semibold tracking-[0.18em] text-black/35 uppercase">Option sets</p>
          <ul className="space-y-0.5">
            {TABS.map((item) => {
              const active = item.id === tab;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => changeTab(item.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      active ? "bg-brand text-white shadow-sm" : "text-black/65 hover:bg-brand/8 hover:text-brand",
                    )}
                  >
                    <item.icon className={cn("text-base", active ? "text-white" : "text-brand")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active ? <span className="size-1.5 rounded-full bg-brand-red" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <DataTable
          columns={columns}
          rows={paged}
          rowId={(row) => row.id}
          loading={loading}
          search={{
            value: search,
            onChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            placeholder: `Search ${current.label.toLowerCase()}…`,
          }}
          toolbarActions={
            <DashButton variant="outline" icon={<RiAddLine className="text-base" />} onClick={() => setAdding(true)}>
              Add option
            </DashButton>
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
                onClick={() => void patch(ids, { isActive: true }, `${ids.length} options enabled`)}
              >
                Enable
              </DashButton>
              <DashButton
                variant="red"
                size="sm"
                icon={<RiForbid2Line className="text-sm" />}
                onClick={() => void patch(ids, { isActive: false }, `${ids.length} options disabled`)}
              >
                Disable
              </DashButton>
            </>
          )}
          rowActions={(row) => (
            <>
              <ActionIcon
                label="Rename option"
                icon={<RiPencilLine />}
                tone="neutral"
                onClick={() => {
                  setRenaming(row);
                  setRenameValue(row.name);
                }}
              />
              {row.isActive ? (
                <ActionIcon
                  label="Disable option"
                  icon={<RiForbid2Line />}
                  tone="red"
                  onClick={() => void patch([row.id], { isActive: false }, `${row.name} disabled`)}
                />
              ) : (
                <ActionIcon
                  label="Enable option"
                  icon={<RiCheckboxCircleLine />}
                  onClick={() => void patch([row.id], { isActive: true }, `${row.name} enabled`)}
                />
              )}
            </>
          )}
          page={page}
          totalPages={Math.max(1, Math.ceil(filtered.length / limit))}
          total={filtered.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
          empty={
            <EmptyState
              icon={<RiListSettingsLine />}
              title={search ? "No options match that search" : `No ${current.label.toLowerCase()} yet`}
              description={
                search
                  ? "Try a different term or clear the search."
                  : "Add the first option so sellers can pick it when listing."
              }
              action={
                <DashButton icon={<RiAddLine className="text-base" />} onClick={() => setAdding(true)}>
                  Add option
                </DashButton>
              }
            />
          }
        />
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-lg">Add to {current.label.toLowerCase()}</DialogTitle>
            <DialogDescription>Sellers will see this option immediately after you save it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="option-name" className="text-xs font-semibold tracking-wide text-black/60 uppercase">
                Name
              </label>
              <input
                id="option-name"
                value={name}
                autoFocus
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void create();
                }}
                placeholder={`New ${current.label.toLowerCase().replace(/s$/, "")}`}
                className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
              />
            </div>
            {tab === "models" ? (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold tracking-wide text-black/60 uppercase">Parent make</span>
                <DashSelect
                  value={make}
                  onChange={setMake}
                  ariaLabel="Parent make"
                  className="h-11 w-full"
                  options={[
                    { value: "", label: "Select make" },
                    ...makes.map((item) => ({ value: item.id, label: item.name })),
                  ]}
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <DashButton variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </DashButton>
            <DashButton
              icon={<RiAddLine className="text-base" />}
              disabled={!name.trim() || (tab === "models" && !make)}
              onClick={() => void create()}
            >
              Add option
            </DashButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renaming)} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading text-lg">Rename option</DialogTitle>
            <DialogDescription>The slug is regenerated from the new name.</DialogDescription>
          </DialogHeader>
          <input
            value={renameValue}
            autoFocus
            onChange={(event) => setRenameValue(event.target.value)}
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
          />
          <DialogFooter>
            <DashButton variant="outline" onClick={() => setRenaming(null)}>
              Cancel
            </DashButton>
            <DashButton
              disabled={!renameValue.trim()}
              onClick={() => {
                if (!renaming) return;
                void patch([renaming.id], { name: renameValue.trim() }, "Option renamed");
                setRenaming(null);
              }}
            >
              Save
            </DashButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
