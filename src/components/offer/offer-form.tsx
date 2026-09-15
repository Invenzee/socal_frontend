"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { RiArrowDownSLine } from "react-icons/ri";
import { toast } from "sonner";
import { api, ApiRequestError } from "@/lib/api";
import { getGuestId, markOfferSubmitted } from "@/lib/guest";
import type { TaxonomyItem } from "@/types/api";
import { cn } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear + 1 - 1950 + 1 }, (_, index) => String(currentYear + 1 - index));

type OfferFormProps = {
  compact?: boolean;
  tone?: "plain" | "brand";
  onSuccess?: () => void;
  className?: string;
};

function FieldShell({
  children,
  className = "",
  tone = "plain",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "plain" | "brand";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white px-4 py-3.5",
        tone === "brand"
          ? "border-brand/30 shadow-xs focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/20"
          : "border-black/8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function OfferForm({ compact = false, tone = "plain", onSuccess, className }: OfferFormProps) {
  const router = useRouter();
  const [taxonomy, setTaxonomy] = useState<{ makes: TaxonomyItem[]; conditions: TaxonomyItem[] }>({
    makes: [],
    conditions: [],
  });
  const [models, setModels] = useState<TaxonomyItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    licensePlate: "",
    year: "",
    make: "",
    model: "",
    mileage: "",
    condition: "",
    city: "",
    zip: "",
  });

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    void api<{ makes: TaxonomyItem[]; conditions: TaxonomyItem[] }>("/taxonomy/all")
      .then((data) => setTaxonomy({ makes: data.makes, conditions: data.conditions }))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!form.make) {
      setModels([]);
      return;
    }
    void api<{ items: TaxonomyItem[] }>(`/taxonomy/makes/${form.make}/models`)
      .then((data) => setModels(data.items))
      .catch(() => setModels([]));
  }, [form.make]);

  const yearOptions = useMemo(() => YEARS.map((year) => ({ id: year, name: year })), []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.phone || !isPossiblePhoneNumber(form.phone)) {
      setError("Enter a valid phone number for the selected country.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/offers", {
        method: "POST",
        body: JSON.stringify({
          guestId: getGuestId(),
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          licensePlate: form.licensePlate,
          year: Number(form.year),
          make: form.make,
          model: form.model,
          mileage: Number(form.mileage),
          condition: form.condition,
          city: form.city,
          zip: form.zip,
        }),
      });
      markOfferSubmitted();
      onSuccess?.();
      router.push("/get-an-offer/thank-you");
    } catch (err) {
      if (err instanceof ApiRequestError && (err.status === 409 || err.code === "OFFER_EXISTS")) {
        markOfferSubmitted();
        onSuccess?.();
        router.push("/get-an-offer/thank-you");
        return;
      }
      setError(err instanceof ApiRequestError ? err.message : "Could not submit your request.");
      toast.error(err instanceof ApiRequestError ? err.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {error ? <p className="text-sm font-medium text-brand-red">{error}</p> : null}
      <div className={cn("grid grid-cols-1 gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        <TextField
          tone={tone}
          placeholder="Full name"
          value={form.fullName}
          onChange={(value) => setField("fullName", value)}
          required
        />
        <TextField
          tone={tone}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(value) => setField("email", value)}
          required
        />
        <FieldShell tone={tone} className={compact ? "sm:col-span-2" : "lg:col-span-1"}>
          <PhoneInput
            international
            defaultCountry="US"
            value={form.phone}
            onChange={(value) => setField("phone", value || "")}
            className="phone-input !border-0 !bg-transparent !p-0"
          />
        </FieldShell>
        <TextField
          tone={tone}
          placeholder="License plate"
          value={form.licensePlate}
          onChange={(value) => setField("licensePlate", value)}
          required
        />
        <SelectField
          tone={tone}
          placeholder="Year"
          value={form.year}
          onChange={(value) => setField("year", value)}
          options={yearOptions}
          required
        />
        <SelectField
          tone={tone}
          placeholder="Make"
          value={form.make}
          onChange={(value) => {
            setField("make", value);
            setField("model", "");
          }}
          options={taxonomy.makes}
          required
        />
        <SelectField
          tone={tone}
          placeholder="Model"
          value={form.model}
          onChange={(value) => setField("model", value)}
          options={models}
          required
        />
        <TextField
          tone={tone}
          placeholder="Mileage"
          type="number"
          value={form.mileage}
          onChange={(value) => setField("mileage", value)}
          required
        />
        <SelectField
          tone={tone}
          placeholder="Condition"
          value={form.condition}
          onChange={(value) => setField("condition", value)}
          options={taxonomy.conditions}
          required
        />
        <TextField tone={tone} placeholder="City" value={form.city} onChange={(value) => setField("city", value)} required />
        <TextField tone={tone} placeholder="ZIP" value={form.zip} onChange={(value) => setField("zip", value)} required />
      </div>
      <div className={cn("flex", compact ? "justify-stretch sm:justify-end" : "justify-center pt-2")}>
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex min-w-[180px] cursor-pointer items-center justify-center rounded-[8px] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:brightness-110 sm:text-base",
            compact && "w-full sm:w-auto",
            tone === "brand" ? "bg-brand-red shadow-md" : "bg-brand",
          )}
        >
          {submitting ? "Submitting..." : "Get an offer"}
        </button>
      </div>
    </form>
  );
}

function TextField({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  tone = "plain",
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  tone?: "plain" | "brand";
}) {
  return (
    <FieldShell tone={tone}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 0 : undefined}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35 sm:text-[15px]"
      />
    </FieldShell>
  );
}

function SelectField({
  placeholder,
  value,
  onChange,
  options,
  required,
  tone = "plain",
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string }>;
  required?: boolean;
  tone?: "plain" | "brand";
}) {
  return (
    <FieldShell tone={tone} className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`w-full appearance-none bg-transparent pr-8 text-sm outline-none sm:text-[15px] ${value ? "text-black" : "text-black/35"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-black">
            {option.name}
          </option>
        ))}
      </select>
      <RiArrowDownSLine
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2",
          tone === "brand" ? "text-brand" : "text-black/35",
        )}
      />
    </FieldShell>
  );
}
