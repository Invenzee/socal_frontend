"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthSubmitButton } from "@/components/auth/auth-shell";
import { api, ApiRequestError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setSent(true);
      toast.success("If that email exists, a reset code is on the way.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not send reset code.");
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      backgroundSrc="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80"
      backgroundAlt="Vehicle background"
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </>
      }
    >
      {sent ? (
        <p className="text-sm text-black/70">
          Check your inbox, then{" "}
          <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="font-semibold text-brand">
            enter your reset code
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField
            id="forgot-email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <AuthSubmitButton>Send reset code</AuthSubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
