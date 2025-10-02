import axios from "axios";

// 1) Make sure this is your machine's LAN IP the phone can reach.
//    Try `ipconfig` (Windows) or `ifconfig` (Mac) and pick the Wi-Fi IPv4.
export const SERVER = "http://192.168.1.4:3001";

// Use a client with sane defaults + timeout.
const api = axios.create({
  baseURL: SERVER,
  timeout: 10000,
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

export async function agentConvert(input: string) {
  const { data } = await api.post("/agent", { input });
  try {
    return JSON.parse(data.output);
  } catch {
    return data.output;
  }
}

// If your backend returns an array of strings, this is fine.
export async function fetchCategories() {
  const { data } = await api.get<string[]>("/categories");
  console.log("[API] /categories =>", data);
  return data;
}

/**
 * Robust taxes fetch:
 * - Sends params via axios (numbers stay numbers)
 * - Maps Appwrite `$id` to `id` so your UI gets what it expects
 * - Logs the raw payload for debugging
 */
export type UITax = {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  year: number;
};

export async function fetchTaxes(params: {
  category?: string;
  year?: number;
  amount?: number;
} = {}) {
  // 2) Let axios handle params; avoid stringifying numbers manually.
  const { data } = await api.get("/taxes", { params });
  console.log("[API] /taxes raw =>", data);

  // 3) Map `$id` (Appwrite) to `id` (your UI expectation).
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
