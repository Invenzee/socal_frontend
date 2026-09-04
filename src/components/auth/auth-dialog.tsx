"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useAuthDialog } from "@/providers/auth-dialog-provider";
import type { AuthUser } from "@/types/api";

type Step = "form" | "verify";

export default function AuthDialog() {
  const router = useRouter();
  const { open, close, consumePending } = useAuthDialog();
  const { setUser, refresh } = useAuth();
  const [tab, setTab] = useState("signup");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signup, setSignup] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");

  useEffect(() => {
    if (open) {
      setStep("form");
      setError("");
      setCode("");
    }
  }, [open]);

  async function afterAuth(user: AuthUser, needsVerification: boolean) {
    setUser(user);
    if (needsVerification || !user.emailVerified) {
      setStep("verify");
      return;
    }
    finish();
  }

  function finish() {
    const pending = consumePending();
    setStep("form");
    setCode("");
    setError("");
    close();
    void refresh();
    if (!pending) return;
    window.setTimeout(() => {
      if (pending.type === "sell") router.push("/sell");
      window.dispatchEvent(new CustomEvent("socal:auth-resume", { detail: pending }));
    }, 50);
  }

  async function onSignup(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!signup.phone || !isValidPhoneNumber(signup.phone)) {
      setError("Enter a valid phone number for the selected country.");
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser; needsVerification: boolean }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...signup, role: "buyer" }),
      });
      await afterAuth(data.user, data.needsVerification);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser; needsVerification: boolean }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(login),
      });
      await afterAuth(data.user, data.needsVerification);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ code, email: signup.email || login.email }),
      });
      setUser(data.user);
      toast.success("Email verified");
      finish();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await api("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: signup.email || login.email }),
      });
      toast.success("Code sent");
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Could not resend.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? close() : undefined)}>
      <DialogContent className="max-w-[440px] border-black/10 bg-white sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-black">
            {step === "verify" ? "Verify your email" : "Continue to contact the seller"}
          </DialogTitle>
        </DialogHeader>

        {error ? <p className="text-sm text-brand-red">{error}</p> : null}

        {step === "verify" ? (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-sm text-black/60">
              Enter the 6-digit code we emailed you. Check spam if it is not in your inbox.
            </p>
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification code</Label>
              <Input
                id="verify-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="tracking-[0.4em]"
              />
            </div>
            <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-brand text-white">
              {loading ? "Verifying..." : "Verify and continue"}
            </Button>
            <button type="button" onClick={() => void resend()} className="text-sm font-medium text-brand">
              Resend code
            </button>
          </form>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Sign up</TabsTrigger>
              <TabsTrigger value="login">Log in</TabsTrigger>
            </TabsList>
            <TabsContent value="signup">
              <form onSubmit={onSignup} className="space-y-3 pt-3">
                <Field label="Full name" value={signup.fullName} onChange={(v) => setSignup({ ...signup, fullName: v })} />
                <Field
                  label="Email"
                  type="email"
                  value={signup.email}
                  onChange={(v) => setSignup({ ...signup, email: v })}
                />
                <div className="space-y-2">
                  <Label>Phone number</Label>
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={signup.phone}
                    onChange={(value) => setSignup({ ...signup, phone: value || "" })}
                    className="phone-input"
                  />
                </div>
                <Field
                  label="Password"
                  type="password"
                  value={signup.password}
                  onChange={(v) => setSignup({ ...signup, password: v })}
                />
                <Button type="submit" disabled={loading} className="w-full bg-brand text-white">
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="login">
              <form onSubmit={onLogin} className="space-y-3 pt-3">
                <Field
                  label="Email"
                  type="email"
                  value={login.email}
                  onChange={(v) => setLogin({ ...login, email: v })}
                />
                <Field
                  label="Password"
                  type="password"
                  value={login.password}
                  onChange={(v) => setLogin({ ...login, password: v })}
                />
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm font-medium text-brand" onClick={close}>
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-brand text-white">
                  {loading ? "Signing in..." : "Log in"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}
