import axios from "axios";
import { ENV } from "../config/env";

type FxCache = { base?: string; ts?: number; rates?: Record<string, number> };
let fxCache: FxCache = {};


/** Multi-provider FX getter with caching and cross-rate fallback */
export async function getFxRate(base: string, target: string): Promise<number> {
  const B = base.toUpperCase().trim();
  const T = target.toUpperCase().trim();
  const now = Date.now();



  // 1) exchangerate.host
  try {
    const { data } = await axios.get(`https://api.exchangerate.host/latest`, {
      params: { base: B, symbols: T },
    });
    const rate = data?.rates?.[T];
    if (typeof rate === "number") {
      fxCache = { base: B, ts: now, rates: { ...(fxCache.rates || {}), [T]: rate } };
      return rate;
    }
  } catch (e: any) {
    console.warn("[FX] exchangerate.host failed:", e?.message);
  }

  // 2) frankfurter.dev (direct or cross via EUR)
  try {
    const { data } = await axios.get("https://api.frankfurter.dev/v1/latest", {
      params: { base: B, symbols: T },
    });
    const rate = data?.rates?.[T];
    if (typeof rate === "number") {
      fxCache = { base: B, ts: now, rates: { ...(fxCache.rates || {}), [T]: rate } };
      return rate;
    }
  } catch (e: any) {
    try {
      const { data } = await axios.get("https://api.frankfurter.dev/v1/latest", {
        params: { base: "EUR", symbols: `${B},${T}` },
      });
      const rB = data?.rates?.[B];
      const rT = data?.rates?.[T];
      if (typeof rB === "number" && typeof rT === "number") {
        const rate = rT / rB;
        fxCache = { base: B, ts: now, rates: { ...(fxCache.rates || {}), [T]: rate } };
        return rate;
      }
    } catch (e2: any) {
      console.warn("[FX] frankfurter (via EUR) failed:", e2?.message);
    }
    console.warn("[FX] frankfurter failed:", e?.message);
  }

  // 3) open.er-api.com
  try {
    const { data } = await axios.get(`https://open.er-api.com/v6/latest/${encodeURIComponent(B)}`);
    const rate = data?.rates?.[T];
    if (typeof rate === "number") {
      fxCache = { base: B, ts: now, rates: { ...(fxCache.rates || {}), [T]: rate } };
      return rate;
    }
  } catch (e: any) {
    console.warn("[FX] er-api failed:", e?.message);
  }

  throw new Error(`Could not fetch FX rate for ${B} -> ${T}`);
}
