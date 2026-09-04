"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthSubmitButton } from "@/components/auth/auth-shell";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AuthUser } from "@/types/api";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const defaultRole = searchParams.get("role") === "seller" ? "seller" : "buyer";
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">(defaultRole);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phone || !isValidPhoneNumber(phone)) {
      toast.error("Enter a valid phone number for the selected country.");
      return;
    }
    setLoading(true);
    try {
      const data = await api<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, phone, role }),
      });
      setUser(data.user);
      router.push("/verify-email");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      backgroundSrc="https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=2000&q=80"
      backgroundAlt="Yellow truck background"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="register-email" label="Email Address" type="email" placeholder="Enter your email address" value={email} onChange={setEmail} autoComplete="email" />
        <AuthField id="register-name" label="Full Name" placeholder="Enter your full name" value={fullName} onChange={setFullName} autoComplete="name" />
        <div>
          <label className="mb-1.5 block text-sm text-black/45">Phone Number</label>
          <PhoneInput international defaultCountry="US" value={phone} onChange={(value) => setPhone(value || "")} className="phone-input" />
        </div>
        <div>
          <p className="mb-1.5 text-sm text-black/45">I am a</p>
          <div className="grid grid-cols-2 gap-2">
            {(["buyer", "seller"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize ${
                  role === option ? "border-brand bg-brand text-white" : "border-black/10 bg-white text-black"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <AuthField id="register-password" label="Password" placeholder="Create your password" value={password} onChange={setPassword} autoComplete="new-password" showPasswordToggle />
        <AuthSubmitButton>{loading ? "Creating..." : "Create an account"}</AuthSubmitButton>
      </form>
    </AuthShell>
  );
}
