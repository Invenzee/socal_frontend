"use client";

import { RiArrowDownSLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

export type DashSelectOption = { value: string; label: string };

type DashSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: DashSelectOption[];
  label?: string;
  className?: string;
  ariaLabel?: string;
};

export default function DashSelect({ value, onChange, options, label, className, ariaLabel }: DashSelectProps) {
  return (
    <div
      className={cn(
        "group relative flex h-9 items-center rounded-lg border border-black/10 bg-white pl-3 text-sm shadow-xs transition-colors focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 hover:border-brand/40",
        className,
      )}
    >
      {label ? <span className="mr-1.5 shrink-0 text-xs font-medium text-black/40">{label}</span> : null}
      <select
        aria-label={ariaLabel || label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full cursor-pointer appearance-none bg-transparent pr-7 text-sm font-medium text-black outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <RiArrowDownSLine className="pointer-events-none absolute right-2 text-base text-brand" />
    </div>
  );
}
