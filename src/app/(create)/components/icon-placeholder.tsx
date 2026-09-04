"use client";

import type { ComponentType, SVGProps } from "react";
import * as Ri from "react-icons/ri";

type IconPlaceholderProps = SVGProps<SVGSVGElement> & {
  lucide?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  className?: string;
};

export function IconPlaceholder({
  remixicon = "RiQuestionLine",
  className,
  lucide: _lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  ...props
}: IconPlaceholderProps) {
  const icons = Ri as unknown as Record<string, ComponentType<{ className?: string }>>;
  const Icon = icons[remixicon] ?? icons.RiQuestionLine;
  return <Icon className={className} {...props} />;
}
