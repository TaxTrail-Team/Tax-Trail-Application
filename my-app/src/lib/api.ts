// app/lib/api.ts
import axios from "axios";

// 1) Make sure this is your machine's LAN IP the phone can reach.
//    Try `ipconfig` (Windows) or `ifconfig` (Mac) and pick the Wi-Fi IPv4.
export const SERVER = "https://tax-trail-application.onrender.com";
// https://tax-trail-application.onrender.com
// http://192.168.1.4:3001
// Use a client with sane defaults + timeout.
const api = axios.create({
  baseURL: SERVER,
  timeout: 30000,
});

// Simple reachability check you can call once on app load.
export async function pingServer() {
  try {
    const { data } = await api.get("/health");
    console.log("[API] /health =>", data);
    return true;
  } catch (e: any) {
    console.log("[API] /health error:", e?.message);
    return false;
  }
}
export async function fetchYears(): Promise<number[]> {
  const { data } = await api.get("/years");
  console.log("[API] /years =>", data);
  return data;
}

export async function agentConvert(input: string) {
  try {
    const { data } = await api.post("/agent", { input });
    const out = typeof data?.output === "string" ? JSON.parse(data.output) : data?.output;
    return out ?? { target: null, items: [] };
  } catch (e: any) {
    console.log("[agentConvert] ERR:", e?.message, e?.response?.status, e?.response?.data);
    throw e;
  }
}

// If your backend returns an array of strings, this is fine.
export async function fetchCategories() {
  const { data } = await api.get<string[]>("/categories");
  console.log("[API] /categories =>", data);
  return data;
}

/** UI tax shape (post-mapped on server) */
export type UITax = {
  id: string;
  name: string;
  category: string;
  amount: number;     // amount in the CURRENT currency for results
  base_amount_lkr?: number;
  currency: string;   // "LKR" for preview or target code for results
  year: number;
};

export async function fetchTaxes(params: {
  category?: string;
  year?: number;
  amount?: number;
} = {}) {
  const { data } = await api.get("/taxes", { params });
  console.log("[API] /taxes raw =>", data);
  // Server already maps, but keep this defensive:
  const mapped: UITax[] = (Array.isArray(data) ? data : []).map((d: any) => ({
    id: d.$id ?? d.id ?? "",
    name: d.name,
    category: d.category,
    amount: typeof d.amount === "string" ? Number(d.amount) : d.amount,
    currency: d.currency ?? "LKR",
    year: typeof d.year === "string" ? Number(d.year) : d.year,
  }));
  console.log("[API] /taxes mapped =>", mapped.length, "items");
  return mapped;
}

export async function convertFilters(params: {
  category?: string;
  year?: number;
  amount?: number;
  target: string;
}) {
  const { data } = await api.get("/convert-filters", { params });
  return data as {
    base: string;
    target: string;
    rate: number;
    rate_ts: string;
    items: UITax[];
  };
}

export type CurrencyInfo = {
  code: string;
  description: string;
  flagEmoji?: string;
  flagPng?: string;
  cca2?: string;
};

export async function fetchCurrencies() {
  const { data } = await api.get<CurrencyInfo[]>("/fx/currencies");
  return data;
}

export async function fetchSymbols() {
  const { data } = await api.get("/symbols");
  return data as Record<string, { code: string; description: string }>;
}

export async function fetchGoogleLiveRate(params: { base?: string; target: string }) {
  const { base = "LKR", target } = params;
  const { data } = await api.get("/live/google-rate", { params: { base, target } });
  // data: { via, base, target, rate, rate_ts, source }
  return data as {
    via: "google" | "fallback";
    base: string;
    target: string;
    rate: number;
    rate_ts: string;
    source?: string;
  };
}

// keep your existing imports/config

// keep your existing imports/config

export async function fetchAllLiveRatesGoogle(params: {
  base?: string;
  limit?: number;
  concurrency?: number;
} = {}) {
  const { base = "LKR", limit = 40, concurrency = 4 } = params;
  const { data } = await api.get("/live/google-rates-google", {
    params: { base, limit, concurrency },
  });
  // { base, ts, count, items: [{ target, rate, via, source, rate_ts }] }
  return data as {
    base: string;
    ts: string;
    count: number;
    items: Array<{ target: string; rate: number; via: "google"; source?: string; rate_ts: string }>;
  };
}




