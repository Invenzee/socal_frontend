import type { ApiOk } from "@/types/api";

const clientBase = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as
    | ApiOk<T>
    | { success: false; error?: { message?: string; code?: string } }
    | null;

  if (!res.ok || !body || !("success" in body) || body.success === false) {
    throw new ApiRequestError(
      res.status,
      body && "error" in body ? body.error?.message || "Request failed" : "Request failed",
      body && "error" in body ? body.error?.code || "ERROR" : "ERROR",
    );
  }

  return body.data;
}

export async function api<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${clientBase}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  return parse<T>(res);
}

export async function apiServer<T>(path: string, init: RequestInit = {}) {
  const { cookies, headers } = await import("next/headers");
  const cookieStore = await cookies();
  const headerStore = await headers();
  const origin = process.env.BACKEND_ORIGIN || "http://localhost:5000";
  const cookieHeader = cookieStore.toString() || headerStore.get("cookie") || "";

  const res = await fetch(`${origin}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  return parse<T>(res);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} km`;
}

export function entityId(value: { id?: string; _id?: string } | string | undefined) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id || String(value._id || "");
}
