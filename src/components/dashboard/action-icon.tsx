"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "text-brand hover:bg-brand hover:text-white",
  red: "text-brand-red hover:bg-brand-red hover:text-white",
  neutral: "text-black/55 hover:bg-black/85 hover:text-white",
} as const;

type ActionIconProps = {
  label: string;
  icon: ReactNode;
  tone?: keyof typeof TONES;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/** Square icon-only control. Every one of them carries a tooltip. */
export default function ActionIcon({
  label,
  icon,
  tone = "brand",
  href,
  onClick,
  disabled,
  className,
}: ActionIconProps) {
  const classes = cn(
    "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-black/8 bg-white text-[15px] shadow-xs transition-all duration-150",
    "hover:-translate-y-px hover:border-transparent hover:shadow-sm active:translate-y-0",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:pointer-events-none disabled:opacity-40",
    TONES[tone],
    className,
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          href ? (
            <Link href={href} aria-label={label} className={classes}>
              {icon}
            </Link>
          ) : (
            <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className={classes}>
              {icon}
            </button>
          )
        }
      />
      <TooltipContent className="bg-brand text-white">{label}</TooltipContent>
    </Tooltip>
  );
}
