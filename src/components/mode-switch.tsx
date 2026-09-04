"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AuthUser } from "@/types/api";
import { cn } from "@/lib/utils";

type ModeSwitchProps = {
  className?: string;
  tone?: "light" | "dark" | "brand";
};

export default function ModeSwitch({ className, tone = "light" }: ModeSwitchProps) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);

  if (!user || user.role === "admin") return null;

  async function switchMode(mode: "buyer" | "seller") {
    if (!user || user.role === mode || saving) return;
    setSaving(true);
    try {
      const data = await api<{ user: AuthUser }>("/auth/mode", {
        method: "PATCH",
        body: JSON.stringify({ mode }),
      });
      setUser(data.user);
      if (pathname.startsWith("/dashboard")) {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not switch mode.");
    } finally {
      setSaving(false);
    }
  }

  const tones = {
    light: {
      wrap: "border-black/10 bg-black/4",
      idle: "text-black/50 hover:text-black",
      active: "bg-white text-brand shadow-xs",
    },
    dark: {
      wrap: "border-white/15 bg-white/10",
      idle: "text-white/60 hover:text-white",
      active: "bg-white text-brand shadow-xs",
    },
    brand: {
      wrap: "border-brand/20 bg-brand/8",
      idle: "text-brand/70 hover:text-brand",
      active: "bg-brand text-white shadow-xs",
    },
  }[tone];

  return (
    <div
      className={cn("inline-flex rounded-lg border p-0.5", tones.wrap, className)}
      role="group"
      aria-label="Marketplace mode"
    >
      {(["buyer", "seller"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          disabled={saving}
          onClick={() => void switchMode(mode)}
          className={cn(
            "cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors disabled:opacity-60",
            user.role === mode ? tones.active : tones.idle,
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
