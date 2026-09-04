"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-brand text-white shadow-sm hover:bg-[#0158cc] hover:shadow-md",
  red: "bg-brand-red text-white shadow-sm hover:bg-[#e62222] hover:shadow-md",
  outline: "border border-brand/25 bg-white text-brand hover:border-brand hover:bg-brand/6",
  ghost: "text-brand hover:bg-brand/8",
  onBrand: "bg-white text-brand shadow-sm hover:bg-white/90",
  onBrandGhost: "border border-white/30 bg-white/10 text-white hover:bg-white/20",
  danger: "border border-brand-red/25 bg-white text-brand-red hover:border-brand-red hover:bg-brand-red/8",
} as const;

const SIZES = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-9 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
} as const;

type BaseProps = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

function classes({ variant = "primary", size = "md", className }: BaseProps) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-all duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function DashButton({
  variant,
  size,
  icon,
  children,
  className,
  ...props
}: BaseProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type="button" className={classes({ variant, size, className })} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function DashLinkButton({
  variant,
  size,
  icon,
  children,
  className,
  ...props
}: BaseProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={classes({ variant, size, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}
