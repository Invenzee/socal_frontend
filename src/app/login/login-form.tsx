"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthSubmitButton } from "@/components/auth/auth-shell";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AuthUser } from "@/types/api";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next") || "/dashboard";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser; needsVerification: boolean }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      await refresh();
      if (!data.user.emailVerified) {
        router.push(`/verify-email?next=${encodeURIComponent(next)}`);
        return;
      }
      router.push(next);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Login"
      backgroundSrc="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80"
      backgroundAlt="Car background"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="login-email" label="Email Address" type="email" placeholder="Enter your email address" value={email} onChange={setEmail} autoComplete="email" />
        <div>
          <AuthField id="login-password" label="Password" placeholder="Enter your password" value={password} onChange={setPassword} autoComplete="current-password" showPasswordToggle />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>
        <AuthSubmitButton>{loading ? "Logging in..." : "Login"}</AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
