import { Router } from "express";
import { SYMBOLS } from "../constants/currencies";
import { getFxRate } from "../utils/fx";
import { getGoogleRateViaLangChain, serpTool } from "../llm/langchain";
import { mapWithConcurrency } from "../utils/concurrency";

const router = Router();

// /fx-debug
router.get("/fx-debug", async (req, res) => {
  try {
    const base = ((req.query.base as string) || "LKR").toUpperCase();
    const target = ((req.query.target as string) || "USD").toUpperCase();
    const rate = await getFxRate(base, target);
    res.json({ base, target, rate, rate_ts: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "fx-debug failed" });
  }
});

// /symbols
router.get("/symbols", (_req, res) => res.json(SYMBOLS));

// /fx/currencies
router.get("/fx/currencies", (_req, res) => {
  const list = Object.values(SYMBOLS).map(({ code, description }) => ({ code, description }));
  res.json(list);
});

// Single pair via Google→LLM then fallback
router.get("/live/google-rate", async (req, res) => {
  const base = String(req.query.base || "LKR").toUpperCase();
  const target = String(req.query.target || "USD").toUpperCase();

  try {
    try {
      const { rate, source } = await getGoogleRateViaLangChain(base, target);
      return res.json({ via: "google", base, target, rate, rate_ts: new Date().toISOString(), source });
    } catch (e: any) {
      console.warn("[/live/google-rate] LC/Google failed:", e?.message);
    }
    const rate = await getFxRate(base, target);
    res.json({ via: "fallback", base, target, rate, rate_ts: new Date().toISOString(), source: "exchangerate.host / ECB / ER-API" });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "google-rate failed" });
  }
});

/**
 * IMPORTANT: This route name matches your mobile app call:
 * GET /live/google-rates?base=LKR&limit=40&concurrency=4
 */
router.get("/live/google-rates", async (req, res) => {
  const base = String(req.query.base || "LKR").toUpperCase();
  const limit = Math.max(1, Math.min(60, Number(req.query.limit ?? 40)));
  const concurrency = Math.max(1, Math.min(8, Number(req.query.concurrency ?? 4)));

  if (!serpTool) return res.status(400).json({ error: "SERPAPI_API_KEY not set. Cannot fetch Google rates." });

  const targets = Object.keys(SYMBOLS).filter((c) => c !== base).slice(0, limit);

  try {
    const rows = await mapWithConcurrency(targets, concurrency, async (t) => {
      try {
        const { rate, source } = await getGoogleRateViaLangChain(base, t);
        return { target: t, rate, via: "google" as const, source, rate_ts: new Date().toISOString() };
      } catch (e: any) {
        // skip if LC fails (keep it “LLM-only” for this route)
        return null;
      }
    });

    const items = rows.filter(Boolean) as Array<{ target: string; rate: number; via: "google"; source?: string; rate_ts: string }>;
    items.sort((a, b) => a.target.localeCompare(b.target));

    res.json({ base, ts: new Date().toISOString(), count: items.length, items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "google-rates failed" });
  }
});

// Optional: a mixed route that falls back if LC fails
router.get("/latest/google-rates", async (req, res) => {
  if (!serpTool) return res.status(400).json({ error: "SERPAPI_API_KEY not set." });

  const base = String(req.query.base || "LKR").toUpperCase();
  const limit = Math.max(1, Math.min(60, Number(req.query.limit ?? 20)));
  const concurrency = Math.max(1, Math.min(5, Number(req.query.concurrency ?? 3)));

  const targets = Object.keys(SYMBOLS).filter((c) => c !== base).slice(0, limit);

  try {
    const rows = await mapWithConcurrency(targets, concurrency, async (t) => {
      try {
        const { rate, source } = await getGoogleRateViaLangChain(base, t);
        return { target: t, rate, source, via: "google" as const, rate_ts: new Date().toISOString() };
      } catch {
        try {
          const rate = await getFxRate(base, t);
          return { target: t, rate, source: "fallback providers", via: "fallback" as const, rate_ts: new Date().toISOString() };
        } catch {
          return null;
        }
      }
    });

    const items = (rows.filter(Boolean) as Array<{ target: string; rate: number; source?: string; via: "google" | "fallback"; rate_ts: string }>)
      .sort((a, b) => a.target.localeCompare(b.target));

    res.json({ base, ts: new Date().toISOString(), count: items.length, items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "latest google rates failed" });
  }
});

export default router;
