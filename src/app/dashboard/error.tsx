"use client";

import { useEffect } from "react";
import { RiRefreshLine } from "react-icons/ri";
import { DashButton, DashLinkButton } from "@/components/dashboard/dash-button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="dash-panel grid min-h-80 place-items-center px-6 py-16 text-center">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-brand uppercase">Dashboard</p>
        <h1 className="mt-2 font-heading text-3xl text-black">This page couldn’t load</h1>
        <p className="mt-2 max-w-md text-sm text-black/55">
          Reload to try again, or go back to overview.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <DashButton icon={<RiRefreshLine className="text-base" />} onClick={() => reset()}>
            Reload
          </DashButton>
          <DashLinkButton href="/dashboard" variant="outline">
            Back
          </DashLinkButton>
        </div>
      </div>
    </div>
  );
}
