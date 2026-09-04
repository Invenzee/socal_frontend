"use client";

import { useState } from "react";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiLockPasswordLine,
  RiMailLine,
  RiSaveLine,
  RiShieldUserLine,
  RiUserLine,
} from "react-icons/ri";
import PageHeader from "@/components/dashboard/page-header";
import Panel from "@/components/dashboard/panel";
import StatusPill from "@/components/dashboard/status-pill";
import { DashButton } from "@/components/dashboard/dash-button";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import type { AuthUser } from "@/types/api";
import ModeSwitch from "@/components/mode-switch";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [syncedUser, setSyncedUser] = useState(user);

  // Re-seed the form whenever a fresh user object arrives from the auth provider.
  if (user !== syncedUser) {
    setSyncedUser(user);
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
  }

  if (!user) return null;

  const dirty = fullName !== user.fullName || phone !== user.phone;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await api<{ user: AuthUser }>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ fullName, phone }),
      });
      setUser(data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReset() {
    setSendingReset(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: user!.email }),
      });
      toast.success("Password reset link sent to your inbox");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Could not send reset link.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Profile settings"
        description="Keep your contact details current so buyers and sellers can reach you."
      />

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <div className="space-y-5">
          <section data-dash-reveal className="dash-panel overflow-hidden">
            <div className="relative h-24 bg-brand">
              <span aria-hidden className="absolute -top-8 -right-6 size-32 rounded-full bg-brand-red/30 blur-2xl" />
            </div>
            <div className="-mt-10 flex flex-col items-center px-5 pb-5 text-center">
              <span className="grid size-20 place-items-center rounded-2xl bg-brand-red text-2xl font-bold text-white ring-4 ring-white">
                {initials(user.fullName)}
              </span>
              <p className="mt-3 font-heading text-lg text-black">{user.fullName}</p>
              <p className="text-sm text-black/45">{user.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <StatusPill status={user.role} />
                <StatusPill status={user.status} />
              </div>
            </div>
          </section>

          <Panel title="Account security" description="Verification and password" icon={<RiShieldUserLine />}>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-brand/5 p-3">
                <span className={user.emailVerified ? "text-brand" : "text-brand-red"}>
                  {user.emailVerified ? (
                    <RiCheckboxCircleFill className="text-lg" />
                  ) : (
                    <RiErrorWarningFill className="text-lg" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-black">
                    {user.emailVerified ? "Email verified" : "Email not verified"}
                  </p>
                  <p className="text-xs text-black/50">
                    {user.emailVerified
                      ? "You can message buyers and sellers."
                      : "Verify your email to unlock messaging."}
                  </p>
                </div>
              </div>
              <DashButton
                variant="outline"
                className="w-full"
                icon={<RiLockPasswordLine className="text-base" />}
                disabled={sendingReset}
                onClick={() => void sendReset()}
              >
                {sendingReset ? "Sending…" : "Send password reset link"}
              </DashButton>
            </div>
          </Panel>
        </div>

        <Panel
          title="Personal details"
          description="This information is shown to people you trade with"
          icon={<RiUserLine />}
        >
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold tracking-wide text-black/60 uppercase">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/15"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold tracking-wide text-black/60 uppercase">
                  Email address
                </label>
                <div className="relative">
                  <RiMailLine className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-black/30" />
                  <input
                    id="email"
                    value={user.email}
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-lg border border-black/10 bg-black/3 pr-3 pl-9 text-sm text-black/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide text-black/60 uppercase">Phone number</label>
              <PhoneInput
                international
                defaultCountry="US"
                value={phone}
                onChange={(value) => setPhone(value || "")}
                className="phone-input !h-11 !rounded-lg"
              />
              <p className="text-xs text-black/40">Used for phone leads when a buyer reveals your number.</p>
            </div>

            <div className="grid gap-3 rounded-xl bg-brand/5 p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">Current mode</p>
                <p className="mt-0.5 text-sm font-medium text-black capitalize">{user.role}</p>
                <div className="mt-2">
                  <ModeSwitch tone="brand" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-brand uppercase">Account status</p>
                <p className="mt-0.5 text-sm font-medium text-black capitalize">{user.status}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-black/5 pt-4">
              {dirty ? <p className="text-xs text-brand-red">You have unsaved changes</p> : null}
              <DashButton
                type="submit"
                disabled={!dirty || saving}
                icon={<RiSaveLine className="text-base" />}
              >
                {saving ? "Saving…" : "Save changes"}
              </DashButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
