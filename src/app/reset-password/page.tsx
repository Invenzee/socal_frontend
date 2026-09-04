"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthSubmitButton } from "@/components/auth/auth-shell";
import { api, ApiRequestError } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, password }),
      });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not reset password.");
    }
  };

  return (
    <AuthShell
      title="Reset password"
      backgroundSrc="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80"
      backgroundAlt="Vehicle background"
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="reset-email" label="Email Address" type="email" placeholder="Email" value={email} onChange={setEmail} />
        <AuthField id="reset-code" label="Reset code" placeholder="6-digit code" value={code} onChange={setCode} />
        <AuthField
          id="reset-password"
          label="New password"
          placeholder="New password"
          value={password}
          onChange={setPassword}
          showPasswordToggle
        />
        <AuthSubmitButton>Update password</AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
