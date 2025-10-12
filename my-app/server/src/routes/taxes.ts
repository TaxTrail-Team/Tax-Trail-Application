import { Router } from "express";
import { z } from "zod";
import { db, DB_ID, TAXES } from "../config/appwrite";
import { Query, ID } from "node-appwrite";
import { mapDoc } from "../types/tax";
import { getFxRate } from "../utils/fx";
import { ENV } from "../config/env";
import { buildUserAgent } from "../agents/agent";
import { analyzeAnomaliesWithAI, generateExecutiveSummary } from "../llm/langchain";

const router = Router();

// /categories
router.get("/categories", async (_req, res) => {
  try {
    const resp = await db.listDocuments(DB_ID, TAXES, [Query.limit(100)]);
    const cats = Array.from(new Set(resp.documents.map((d: any) => d.category))).sort();
    res.json(cats);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch categories" });
  }
});

// /taxes
router.get("/taxes", async (req, res) => {
  try {
    const { category, year, amount } = req.query as { category?: string; year?: string; amount?: string };
    const queries: any[] = [Query.limit(100)];
    if (category) queries.push(Query.equal("category", category));
    if (year) queries.push(Query.equal("year", Number(year)));
    if (amount) queries.push(Query.equal("amount", Number(amount)));
    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    res.json(resp.documents.map(mapDoc));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch taxes" });
  }
});

// /convert-filters (deterministic)
router.get("/convert-filters", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const amount = req.query.amount ? Number(req.query.amount) : undefined;
    const target = (req.query.target as string | undefined)?.toUpperCase();
    if (!target) return res.status(400).json({ error: "target is required (e.g., USD)" });

    const queries: any[] = [Query.limit(100)];
    if (category) queries.push(Query.equal("category", category));
    if (typeof year === "number" && !Number.isNaN(year)) queries.push(Query.equal("year", year));
    if (typeof amount === "number" && !Number.isNaN(amount)) queries.push(Query.equal("amount", amount));

    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    const items = resp.documents.map(mapDoc);

    const rate = await getFxRate("LKR", target);
    const rate_ts = new Date().toISOString();

    const out = items.map((it) => ({
      ...it,
      base_amount_lkr: it.amount,
      amount: +(it.amount * rate).toFixed(2),
      currency: target,
    }));

    res.json({ base: "LKR", target, rate, rate_ts, items: out });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "convert-filters failed" });
  }
});

// /agent (LangChain agent)
router.post("/agent", async (req, res) => {
  const t0 = Date.now();
  try {
    const input = String(req.body?.input ?? "");
    if (!input) return res.status(400).json({ error: "Missing input" });

    const exec = await buildUserAgent();

    // Simple timeout wrapper
    const withTimeout = <T,>(p: Promise<T>, ms = 9000): Promise<T> =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`LLM timeout after ${ms}ms`)), ms);
        p.then((v) => { clearTimeout(timer); resolve(v); })
         .catch((e) => { clearTimeout(timer); reject(e); });
      });

    let out: any = null;
    try {
      const result: any = await withTimeout(exec.invoke({ input }), 9000);
      out = result.output ?? result.output_text ?? result;
    } catch (agentErr: any) {
      console.warn("[/agent] agent error/timeout:", agentErr?.message);
    }

    if (!out) {
      out = { target: null, items: [] };
    }

    console.log(`[/agent] done in ${Date.now() - t0}ms →`, typeof out === "string" ? out.slice(0, 120) : JSON.stringify(out).slice(0, 120));
    return res.status(200).json({ output: out });
  } catch (e: any) {
    console.error("[/agent] FATAL >>>", e?.message);
    return res.status(200).json({ output: { target: null, items: [], error: e?.message || "agent failed" } });
  }
});
router.get("/years", async (_req, res) => {
  try {
    const resp = await db.listDocuments(DB_ID, TAXES, [Query.limit(100)]);

    const years = resp.documents
      .map((doc: any) => doc.year)
      .filter((year: any): year is number => typeof year === "number");

    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a); // newest first
    res.json(uniqueYears);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to fetch years" });
  }
});

// /anomaly/ai-insights - AI-powered anomaly analysis
router.post("/anomaly/ai-insights", async (req, res) => {
  console.log("[/anomaly/ai-insights] Request received");
  console.log("Body keys:", Object.keys(req.body));

  try {
    const { yearlyData, mean, deviationThreshold, category } = req.body;

    // Validation with detailed errors
    if (!yearlyData) {
      console.error("[/anomaly/ai-insights] Missing yearlyData");
      return res.status(400).json({ error: "yearlyData is required", received: typeof yearlyData });
    }

    if (!Array.isArray(yearlyData)) {
      console.error("[/anomaly/ai-insights] yearlyData is not an array:", typeof yearlyData);
      return res.status(400).json({ error: "yearlyData must be an array", received: typeof yearlyData });
    }

    if (yearlyData.length === 0) {
      console.error("[/anomaly/ai-insights] yearlyData is empty");
      return res.status(400).json({ error: "yearlyData array is empty" });
    }

    if (typeof mean !== "number") {
      console.error("[/anomaly/ai-insights] Invalid mean:", mean);
      return res.status(400).json({ error: "mean must be a number", received: typeof mean });
    }

    console.log("[/anomaly/ai-insights] Calling AI analysis...");
    const insights = await analyzeAnomaliesWithAI({
      yearlyData,
      mean,
      deviationThreshold: deviationThreshold || 50,
      category,
    });

    console.log("[/anomaly/ai-insights] AI analysis successful");
    res.json({ insights });
  } catch (error: any) {
    console.error("[/anomaly/ai-insights] Error:", error);
    console.error("[/anomaly/ai-insights] Stack:", error?.stack);
    res.status(500).json({
      error: error?.message || "AI analysis failed",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// /anomaly/executive-summary - Generate executive summary
router.post("/anomaly/executive-summary", async (req, res) => {
  console.log("[/anomaly/executive-summary] Request received");
  console.log("Body keys:", Object.keys(req.body));

  try {
    const { yearlyData, mean, topAnomalies, category } = req.body;

    if (!yearlyData) {
      console.error("[/anomaly/executive-summary] Missing yearlyData");
      return res.status(400).json({ error: "yearlyData is required" });
    }

    if (!Array.isArray(yearlyData)) {
      console.error("[/anomaly/executive-summary] yearlyData is not an array:", typeof yearlyData);
      return res.status(400).json({ error: "yearlyData must be an array", received: typeof yearlyData });
    }

    console.log("[/anomaly/executive-summary] Generating summary...");
    const summary = await generateExecutiveSummary({
      yearlyData,
      mean: mean || 0,
      topAnomalies: topAnomalies || [],
      category,
    });

    console.log("[/anomaly/executive-summary] Summary generated successfully");
    res.json({ summary });
  } catch (error: any) {
    console.error("[/anomaly/executive-summary] Error:", error);
    console.error("[/anomaly/executive-summary] Stack:", error?.stack);
    res.status(500).json({
      error: error?.message || "Summary generation failed",
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
});

// /convert (simple)
router.post("/convert", async (req, res) => {
  try {
    const { amount, target } = req.body as { amount: number; target: string };
    if (typeof amount !== "number" || !target) {
      return res.status(400).json({ error: "amount:number and target:string required" });
    }
    const rate = await getFxRate("LKR", target.toUpperCase());
    res.json({
      base: "LKR",
      target: target.toUpperCase(),
      rate,
      rate_ts: new Date().toISOString(),
      amount,
      converted: +(amount * rate).toFixed(2),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "convert failed" });
  }
});

// Admin seed
// router.post("/admin/tax", async (req, res) => {
//   if (req.header("X-Admin-Secret") !== ENV.ADMIN_SECRET) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   try {
//     const payload = z.object({
//       name: z.string(),
//       category: z.string(),
//       amount: z.number(),
//       currency: z.string().length(3).default("LKR"),
//       year: z.number(),
//     }).parse(req.body);

//     const doc = await db.createDocument(DB_ID, TAXES, ID.unique(), {
//       ...payload,
//       currency: (payload.currency || "LKR").toUpperCase(),
//       createdAt: new Date().toISOString(),
//     });
//     res.json(mapDoc(doc));
//   } catch (e: any) {
//     res.status(400).json({ error: e?.message || "Bad payload" });
//   }
// });

export default router;
