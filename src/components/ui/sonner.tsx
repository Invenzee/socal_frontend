"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { RiCheckboxCircleLine, RiCloseCircleLine, RiErrorWarningLine, RiInformationLine, RiLoaderLine } from "react-icons/ri";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <RiCheckboxCircleLine className="size-4 text-brand" />,
        info: <RiInformationLine className="size-4 text-brand" />,
        warning: <RiErrorWarningLine className="size-4 text-brand-red" />,
        error: <RiCloseCircleLine className="size-4 text-brand-red" />,
        loading: <RiLoaderLine className="size-4 animate-spin text-brand" />,
      }}
      {...props}
    />
  );
}
