"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthSubmitButton } from "@/components/auth/auth-shell";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AuthUser } from "@/types/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser, refresh } = useAuth();
  const [code, setCode] = useState("");
  const next = searchParams.get("next") || "/dashboard";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const data = await api<{ user: AuthUser }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ code, email: user?.email }),
      });
      setUser(data.user);
      await refresh();
      toast.success("Email verified");
      router.push(next);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Invalid code.");
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      backgroundSrc="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=2000&q=80"
      backgroundAlt="Truck background"
      footer="We sent a 6-digit code to your inbox."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="verify-code" label="Verification code" placeholder="123456" value={code} onChange={setCode} />
        <AuthSubmitButton>Verify</AuthSubmitButton>
        <button
          type="button"
          className="w-full text-sm font-medium text-brand"
          onClick={() =>
            api("/auth/resend-verification", {
              method: "POST",
              body: JSON.stringify({ email: user?.email }),
            })
              .then(() => toast.success("Code sent"))
              .catch((error) => toast.error(error instanceof ApiRequestError ? error.message : "Could not resend"))
          }
        >
          Resend code
        </button>
      </form>
    </AuthShell>
  );
}
