"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RiCheckLine } from "react-icons/ri";
import type { TaxonomyItem } from "@/types/api";

const GROUPS = ["condition", "make", "category", "fuel", "transmission"] as const;
type FilterGroup = (typeof GROUPS)[number];

type Draft = Record<FilterGroup, Set<string>>;

type FiltersProps = {
  conditions: TaxonomyItem[];
  makes: TaxonomyItem[];
  categories: TaxonomyItem[];
  fuels: TaxonomyItem[];
  transmissions: TaxonomyItem[];
  deferApply?: boolean;
  onApplied?: () => void;
};

function emptyDraft(): Draft {
  return { condition: new Set(), make: new Set(), category: new Set(), fuel: new Set(), transmission: new Set() };
}

function draftFromParams(params: URLSearchParams): Draft {
  const next = emptyDraft();
  GROUPS.forEach((key) => {
    params.get(key)?.split(",").filter(Boolean).forEach((id) => next[key].add(id));
  });
  return next;
}

function FilterCheckbox({
  option,
  checked,
  onChange,
}: {
  option: { id: string; label: string };
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={option.label}
        onClick={onChange}
        className={
          checked
            ? "flex size-[15px] shrink-0 items-center justify-center rounded-[2px] bg-brand-red"
            : "size-[15px] shrink-0 rounded-[2px] border border-black/25 bg-white"
        }
      >
        {checked ? <RiCheckLine className="size-3 text-white" /> : null}
      </button>
      <span className={checked ? "text-sm font-medium text-brand-red" : "text-sm text-black"}>
        {option.label}
      </span>
    </label>
  );
}

function FilterSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/10 py-5 first:pt-0 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-black">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-black/55">{subtitle}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/8 bg-white px-3 py-2.5 last:border-b-0">
      <span className="text-sm text-black/35">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-[50%] bg-transparent text-right text-sm text-black/70 outline-none"
      />
    </div>
  );
}

export default function ListingsFilters({
  conditions,
  makes,
  categories,
  fuels,
  transmissions,
  deferApply = false,
  onApplied,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlDraft = useMemo(() => draftFromParams(searchParams), [searchParams]);
  const [draft, setDraft] = useState<Draft>(urlDraft);
  const [showAllMakes, setShowAllMakes] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [yearMin, setYearMin] = useState(searchParams.get("yearMin") || "");
  const [yearMax, setYearMax] = useState(searchParams.get("yearMax") || "");
  const [kmMin, setKmMin] = useState(searchParams.get("mileageMin") || "");
  const [kmMax, setKmMax] = useState(searchParams.get("mileageMax") || "");

  const selected = deferApply ? draft : urlDraft;

  function isChecked(id: string) {
    return GROUPS.some((group) => selected[group].has(id));
  }

  function pushParams(params: URLSearchParams) {
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggle(group: FilterGroup, id: string) {
    if (deferApply) {
      setDraft((prev) => {
        const next = { ...prev, [group]: new Set(prev[group]) };
        if (next[group].has(id)) next[group].delete(id);
        else next[group].add(id);
        return next;
      });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    const current = new Set((params.get(group)?.split(",") || []).filter(Boolean));
    if (current.has(id)) current.delete(id);
    else current.add(id);
    if (current.size) params.set(group, Array.from(current).join(","));
    else params.delete(group);
    pushParams(params);
  }

  function writeRanges(params: URLSearchParams) {
    const pairs: Array<[string, string]> = [
      ["priceMin", priceMin],
      ["priceMax", priceMax],
      ["yearMin", yearMin],
      ["yearMax", yearMax],
      ["mileageMin", kmMin],
      ["mileageMax", kmMax],
    ];
    pairs.forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  }

  function applyRanges() {
    const params = new URLSearchParams(searchParams.toString());
    writeRanges(params);
    pushParams(params);
  }

  function applyAll() {
    const params = new URLSearchParams(searchParams.toString());
    GROUPS.forEach((group) => {
      const ids = Array.from(draft[group]);
      if (ids.length) params.set(group, ids.join(","));
      else params.delete(group);
    });
    writeRanges(params);
    pushParams(params);
    onApplied?.();
  }

  function clearAll() {
    setDraft(emptyDraft());
    setPriceMin("");
    setPriceMax("");
    setYearMin("");
    setYearMax("");
    setKmMin("");
    setKmMax("");
    if (!deferApply) {
      const params = new URLSearchParams(searchParams.toString());
      [...GROUPS, "priceMin", "priceMax", "yearMin", "yearMax", "mileageMin", "mileageMax"].forEach((key) =>
        params.delete(key),
      );
      pushParams(params);
    }
  }

  const visibleMakes = showAllMakes ? makes : makes.slice(0, 6);

  return (
    <aside className={deferApply ? "flex h-full min-h-0 w-full flex-col" : "w-full lg:w-[240px] lg:shrink-0"}>
      {deferApply ? null : <h2 className="text-xl font-semibold text-black">Filter by</h2>}
      <div className={deferApply ? "min-h-0 flex-1 overflow-y-auto pr-1" : "mt-5"}>
        <FilterSection title="Condition" subtitle="On Special Right Now">
          {conditions.map((option) => (
            <FilterCheckbox
              key={option.id}
              option={{ id: option.id, label: option.name }}
              checked={isChecked(option.id)}
              onChange={() => toggle("condition", option.id)}
            />
          ))}
        </FilterSection>
        <FilterSection title="Make">
          {visibleMakes.map((option) => (
            <FilterCheckbox
              key={option.id}
              option={{ id: option.id, label: option.name }}
              checked={isChecked(option.id)}
              onChange={() => toggle("make", option.id)}
            />
          ))}
          {makes.length > 6 ? (
            <button type="button" onClick={() => setShowAllMakes((v) => !v)} className="mt-1 text-left text-sm font-medium text-brand-red">
              {showAllMakes ? "Show less" : "Show more"}
            </button>
          ) : null}
        </FilterSection>
        <FilterSection title="Fuel">
          {fuels.map((option) => (
            <FilterCheckbox
              key={option.id}
              option={{ id: option.id, label: option.name }}
              checked={isChecked(option.id)}
              onChange={() => toggle("fuel", option.id)}
            />
          ))}
        </FilterSection>
        <FilterSection title="Transmission">
          {transmissions.map((option) => (
            <FilterCheckbox
              key={option.id}
              option={{ id: option.id, label: option.name }}
              checked={isChecked(option.id)}
              onChange={() => toggle("transmission", option.id)}
            />
          ))}
        </FilterSection>
        <FilterSection title="Category">
          {categories.map((option) => (
            <FilterCheckbox
              key={option.id}
              option={{ id: option.id, label: option.name }}
              checked={isChecked(option.id)}
              onChange={() => toggle("category", option.id)}
            />
          ))}
        </FilterSection>
        <div className="mt-6 overflow-hidden rounded-md border border-black/10 bg-neutral-100">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-black">Price</p>
          </div>
          <RangeField label="min" value={priceMin} onChange={setPriceMin} />
          <RangeField label="max" value={priceMax} onChange={setPriceMax} />
          <div className="mt-2 px-3 py-2">
            <p className="text-sm font-medium text-black">Year Min/Max</p>
          </div>
          <div className="flex border-y border-black/8 bg-white">
            <div className="flex flex-1 items-center justify-between gap-2 px-3 py-2.5">
              <span className="text-sm text-black/35">min</span>
              <input type="text" inputMode="numeric" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="w-14 bg-transparent text-right text-sm text-black/70 outline-none" />
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 border-l border-black/8 px-3 py-2.5">
              <span className="text-sm text-black/35">max</span>
              <input type="text" inputMode="numeric" value={yearMax} onChange={(e) => setYearMax(e.target.value)} className="w-14 bg-transparent text-right text-sm text-black/70 outline-none" />
            </div>
          </div>
          <div className="mt-2 px-3 py-2">
            <p className="text-sm font-medium text-black">Kilometers</p>
          </div>
          <RangeField label="min" value={kmMin} onChange={setKmMin} />
          <RangeField label="max" value={kmMax} onChange={setKmMax} />
          {deferApply ? null : (
            <div className="p-3">
              <button
                type="button"
                onClick={applyRanges}
                className="flex w-full cursor-pointer items-center justify-center rounded-md bg-brand-red px-4 py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
      {deferApply ? (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/10 pt-4">
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer rounded-md border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={applyAll}
            className="cursor-pointer rounded-md bg-brand-red px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            Apply
          </button>
        </div>
      ) : null}
    </aside>
  );
}
