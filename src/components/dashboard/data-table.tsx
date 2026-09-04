"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiSearchLine,
  RiSkipLeftLine,
  RiSkipRightLine,
} from "react-icons/ri";
import { Checkbox } from "@/components/ui/checkbox";
import ActionIcon from "@/components/dashboard/action-icon";
import DashSelect from "@/components/dashboard/dash-select";
import { cn } from "@/lib/utils";

export type Column<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headClassName?: string;
  /** Hide below the given breakpoint to keep small screens readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
};

type DataTableProps<T> = {
  columns: Array<Column<T>>;
  rows: T[];
  rowId: (row: T) => string;
  loading?: boolean;

  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  filters?: ReactNode;
  toolbarActions?: ReactNode;

  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  bulkActions?: (ids: string[]) => ReactNode;

  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;

  page?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;

  empty?: ReactNode;
  caption?: string;
  className?: string;
};

const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

function pageWindow(page: number, totalPages: number) {
  const pages: Array<number | "gap"> = [];
  const push = (value: number | "gap") => pages.push(value);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) push(i);
    return pages;
  }
  push(1);
  if (page > 3) push("gap");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) push(i);
  if (page < totalPages - 2) push("gap");
  push(totalPages);
  return pages;
}

export default function DataTable<T>({
  columns,
  rows,
  rowId,
  loading = false,
  search,
  filters,
  toolbarActions,
  selectable = false,
  selected = [],
  onSelectedChange,
  bulkActions,
  rowActions,
  onRowClick,
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
  empty,
  caption,
  className,
}: DataTableProps<T>) {
  const scope = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);

  const ids = useMemo(() => rows.map(rowId), [rows, rowId]);
  const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));
  const someChecked = ids.some((id) => selected.includes(id)) && !allChecked;
  const showPagination = Boolean(onPageChange) && total > 0;

  useGSAP(
    () => {
      if (loading) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targets = scope.current?.querySelectorAll("[data-row]");
      if (!targets?.length) return;
      if (reduced) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.025, ease: "power2.out", overwrite: true },
      );
    },
    { scope, dependencies: [rows, loading] },
  );

  useEffect(() => {
    const node = bulkRef.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(node, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" });
  }, [selected.length > 0]);

  function toggleAll() {
    if (!onSelectedChange) return;
    onSelectedChange(allChecked ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }

  function toggleOne(id: string) {
    if (!onSelectedChange) return;
    onSelectedChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  const colSpan = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const hasToolbar = Boolean(search || filters || toolbarActions);

  return (
    <div ref={scope} className={cn("dash-panel overflow-hidden", className)}>
      {hasToolbar ? (
        <div className="flex flex-col gap-3 border-b border-brand/10 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
          {search ? (
            <div className="group relative flex h-9 min-w-0 flex-1 items-center rounded-lg border border-black/10 bg-white shadow-xs transition-colors focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 hover:border-brand/40 lg:max-w-sm">
              <RiSearchLine className="pointer-events-none absolute left-3 text-base text-brand/70" />
              <input
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
                placeholder={search.placeholder || "Search"}
                className="h-full w-full bg-transparent pr-9 pl-9 text-sm text-black outline-none placeholder:text-black/35"
              />
              {search.value ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => search.onChange("")}
                  className="absolute right-2 grid size-5 cursor-pointer place-items-center rounded-full text-black/40 transition-colors hover:bg-brand-red/10 hover:text-brand-red"
                >
                  <RiCloseLine />
                </button>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {filters}
            {toolbarActions}
          </div>
        </div>
      ) : null}

      {selectable && selected.length > 0 ? (
        <div
          ref={bulkRef}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-brand/15 bg-brand px-3 py-2.5 text-white"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-white text-xs font-bold text-brand tabular-nums">
              {selected.length}
            </span>
            <p className="text-sm font-medium">
              {selected.length === 1 ? "1 row selected" : `${selected.length} rows selected`}
            </p>
            <button
              type="button"
              onClick={() => onSelectedChange?.([])}
              className="cursor-pointer text-xs font-semibold text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">{bulkActions?.(selected)}</div>
        </div>
      ) : null}

      <div className="dash-scroll overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="bg-brand/6 text-left">
              {selectable ? (
                <th scope="col" className="w-10 py-3 pr-2 pl-4">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={someChecked}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                    className="cursor-pointer border-brand/40 data-checked:border-brand data-checked:bg-brand"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap text-brand uppercase",
                    column.hideBelow && HIDE_BELOW[column.hideBelow],
                    column.headClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-brand uppercase">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-t border-black/5">
                    <td colSpan={colSpan} className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="size-10 animate-pulse rounded-lg bg-brand/8" />
                        <span className="h-3 w-1/3 animate-pulse rounded-full bg-brand/8" />
                        <span className="ml-auto h-3 w-16 animate-pulse rounded-full bg-brand/8" />
                      </div>
                    </td>
                  </tr>
                ))
              : rows.map((row) => {
                  const id = rowId(row);
                  const isSelected = selected.includes(id);
                  return (
                    <tr
                      key={id}
                      data-row
                      data-state={isSelected ? "selected" : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "border-t border-black/5 transition-colors",
                        isSelected ? "bg-brand/8" : "hover:bg-brand/4",
                        onRowClick && "cursor-pointer",
                      )}
                    >
                      {selectable ? (
                        <td className="py-3 pr-2 pl-4" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(id)}
                            aria-label="Select row"
                            className="cursor-pointer border-brand/40 data-checked:border-brand data-checked:bg-brand"
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            "px-4 py-3 align-middle text-black/75",
                            column.hideBelow && HIDE_BELOW[column.hideBelow],
                            column.className,
                          )}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                      {rowActions ? (
                        <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">{rowActions(row)}</div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>{empty}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 border-t border-brand/10 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-black/50">
              Showing{" "}
              <span className="font-semibold text-black/75 tabular-nums">
                {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-semibold text-black/75 tabular-nums">{total}</span>
            </p>
            {onLimitChange ? (
              <DashSelect
                label="Rows"
                ariaLabel="Rows per page"
                value={String(limit)}
                onChange={(value) => onLimitChange(Number(value))}
                options={[
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                ]}
                className="h-8"
              />
            ) : null}
          </div>
          <div className="flex items-center gap-1.5">
            <ActionIcon
              label="First page"
              icon={<RiSkipLeftLine />}
              tone="neutral"
              disabled={page <= 1}
              onClick={() => onPageChange?.(1)}
            />
            <ActionIcon
              label="Previous page"
              icon={<RiArrowLeftSLine />}
              tone="brand"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            />
            <div className="flex items-center gap-1">
              {pageWindow(page, Math.max(totalPages, 1)).map((entry, index) =>
                entry === "gap" ? (
                  <span key={`gap-${index}`} className="px-1 text-xs text-black/30">
                    …
                  </span>
                ) : (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => onPageChange?.(entry)}
                    aria-current={entry === page ? "page" : undefined}
                    className={cn(
                      "size-8 cursor-pointer rounded-lg text-xs font-semibold tabular-nums transition-all duration-150",
                      entry === page
                        ? "bg-brand text-white shadow-sm"
                        : "border border-black/8 bg-white text-black/60 hover:border-brand/40 hover:text-brand",
                    )}
                  >
                    {entry}
                  </button>
                ),
              )}
            </div>
            <ActionIcon
              label="Next page"
              icon={<RiArrowRightSLine />}
              tone="brand"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            />
            <ActionIcon
              label="Last page"
              icon={<RiSkipRightLine />}
              tone="neutral"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(totalPages)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
