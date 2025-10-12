// app/lib/api.ts
import axios from "axios";

// 1) Make sure this is your machine's LAN IP the phone can reach.
//    Try `ipconfig` (Windows) or `ifconfig` (Mac) and pick the Wi-Fi IPv4.
// export const SERVER = "https://tax-trail-application.onrender.com";
// export const SERVER = "http://192.168.238.254:3001";    // M - IP
// export const SERVER = "http://10.20.140.254:3001";    // M - IP
export const SERVER = "http://192.168.222.254:3001";    // M - IP
// export const SERVER = "http://192.168.1.3:3001";     // M - IP2
// export const SERVER = "http://172.28.8.46:3001";     // M - IP3
// export const SERVER = "http://10.204.180.254:3001";  // M - IP4

// https://tax-trail-application.onrender.com
//http:// 172.30.48.1:3001

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
  try {
    const { data } = await api.get<string[]>('/categories');
    console.log('[API] /categories =>', data);
    return Array.isArray(data) ? data : [];
  } catch (e: any) {
    console.log("[API] /categories error:", e?.message);
    // Return an empty array so UI can show fallback categories and not crash.
    return [] as string[];
  }
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
  category?: string | string[];
  year?: number | number[];
  amount?: number;
} = {}) {
  // If arrays are provided, serialize them to comma-separated strings for the server
  const q: any = { ...params };
  if (Array.isArray(params.category)) q.category = params.category.join(',');
  if (Array.isArray(params.year)) q.year = params.year.join(',');
  const { data } = await api.get("/taxes", { params: q });
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

// AI-Powered Anomaly Analysis
export type AIAnomalyInsights = {
  insights: Array<{
    year: number;
    explanation: string;
    severity: "low" | "medium" | "high";
    recommendedActions: string[];
  }>;
  overallTrend: string;
  prediction: {
    nextYear: number;
    confidence: "low" | "medium" | "high";
    reasoning: string;
  };
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
};

export async function fetchAIAnomalyInsights(params: {
  yearlyData: Array<{
    year: number;
    total: number;
    count: number;
    percentChange: number;
    deviation: number;
    isHighAnomaly: boolean;
    isLowAnomaly: boolean;
  }>;
  mean: number;
  deviationThreshold: number;
  category?: string;
}): Promise<AIAnomalyInsights> {
  try {
    console.log("[fetchAIAnomalyInsights] Sending request...");
    console.log("[fetchAIAnomalyInsights] Params:", {
      dataPoints: params.yearlyData.length,
      mean: params.mean,
      threshold: params.deviationThreshold,
      category: params.category
    });

    const { data } = await api.post("/anomaly/ai-insights", params);
    console.log("[fetchAIAnomalyInsights] Response received");
    return data.insights;
  } catch (error: any) {
    console.error("[fetchAIAnomalyInsights] Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || error.message || "AI analysis failed");
  }
}

export async function fetchExecutiveSummary(params: {
  yearlyData: Array<{ year: number; total: number; count: number }>;
  mean: number;
  topAnomalies: Array<{ year: number; type: string; deviation: number }>;
  category?: string;
}): Promise<string> {
  try {
    console.log("[fetchExecutiveSummary] Sending request...");
    console.log("[fetchExecutiveSummary] Params:", {
      dataPoints: params.yearlyData.length,
      mean: params.mean,
      anomalies: params.topAnomalies.length,
      category: params.category
    });

    const { data } = await api.post("/anomaly/executive-summary", params);
    console.log("[fetchExecutiveSummary] Response received");
    return data.summary;
  } catch (error: any) {
    console.error("[fetchExecutiveSummary] Error:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error || error.message || "Summary generation failed");
  }
}




