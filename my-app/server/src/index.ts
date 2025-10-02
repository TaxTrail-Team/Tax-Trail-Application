// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { z } from 'zod';
import { Client, Databases, ID, Query } from 'node-appwrite';

import { tool } from '@langchain/core/tools';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate,MessagesPlaceholder } from '@langchain/core/prompts';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Appwrite server client ----------
const aw = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const db = new Databases(aw);
const DB_ID = process.env.APPWRITE_DB_ID!;
const TAXES = process.env.APPWRITE_TAXES_COLLECTION_ID!;

// ---------- Types & helpers ----------
type TaxItem = {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  year?: number;
};

// replace your mapDoc with this
function toYearNumber(y: any): number | undefined {
  if (typeof y === "number") return y;
  if (typeof y === "string") {
    const d = new Date(y);
    if (!isNaN(d.getTime())) return d.getUTCFullYear();
    const n = Number(y);
    if (!isNaN(n)) return n;
  }
  return undefined;
}

function mapDoc(d: any) {
  const amountNum = typeof d.amount === "number" ? d.amount : Number(d.amount);
  return {
    id: d.$id || d.id,
    name: d.name,
    category: d.category,
    amount: isNaN(amountNum) ? 0 : amountNum,
    currency: "LKR",              // <— hard default since column doesn’t exist
    year: toYearNumber(d.year),
    createdAt: d.createdAt,
  };
}



// ---------- Public read endpoints ----------
app.get('/categories', async (_req, res) => {
  try {
    const resp = await db.listDocuments(DB_ID, TAXES, [Query.limit(100)]);
    const cats = Array.from(new Set(resp.documents.map((d: any) => d.category))).sort();
    res.json(cats);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch categories' });
  }
});

app.get('/taxes', async (req, res) => {
  try {
    const { category, year, amount } = req.query as {
      category?: string;
      year?: string;
      amount?: string;
    };
    const queries: any[] = [Query.limit(100)];
    if (category) queries.push(Query.equal('category', category));
    if (year) queries.push(Query.equal('year', Number(year)));
    if (amount) queries.push(Query.equal('amount', Number(amount)));
    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    res.json(resp.documents.map(mapDoc));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to fetch taxes' });
  }
});

// ---------- FX cache ----------
let fxCache: { base?: string; rates?: Record<string, number>; ts?: number } = {};
const FX_TTL_MS = 1000 * 60 * 30;

// ---------- LangChain tools (TWO-ARG SIGNATURE) ----------
const listTaxesTool = tool(
  async (raw: {
    category?: string | null;
    year?: number | string | null;
    amount?: number | string | null;
    limit?: number | string | null;
  }): Promise<string> => {
    // Normalize inputs
    const category = (raw.category ?? undefined) || undefined;
    const year =
      raw.year === undefined || raw.year === null || raw.year === ""
        ? undefined
        : Number(raw.year);
    const amount =
      raw.amount === undefined || raw.amount === null || raw.amount === ""
        ? undefined
        : Number(raw.amount);
    const limitNum =
      raw.limit === undefined || raw.limit === null || raw.limit === ""
        ? 100
        : Math.max(1, Math.min(200, Number(raw.limit)));

    const queries: any[] = [Query.limit(limitNum)];
    if (category) queries.push(Query.equal("category", category));
    if (typeof year === "number" && !Number.isNaN(year)) queries.push(Query.equal("year", year));
    if (typeof amount === "number" && !Number.isNaN(amount)) queries.push(Query.equal("amount", amount));

    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    return JSON.stringify(resp.documents.map(mapDoc));
  },
  {
    name: "list_taxes",
    description:
      "List tax items filtered by optional {category, year, amount}. All stored amounts are in LKR.",
    schema: z.object({
      category: z.union([z.string(), z.null()]).optional(),
      year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      amount: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      limit: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
    }),
  }
);

const convertByFiltersTool = tool(
  async (raw: {
    category?: string | null;
    year?: number | string | null;
    target: string;
    limit?: number | string | null;
  }) => {
    // normalize inputs
    const category = raw.category ?? undefined;
    const yr =
      raw.year === undefined || raw.year === null || raw.year === ""
        ? undefined
        : Number(raw.year);
    const limit =
      raw.limit === undefined || raw.limit === null || raw.limit === ""
        ? 100
        : Math.max(1, Math.min(200, Number(raw.limit)));
    const target = (raw.target || "").toUpperCase();
    if (!target) throw new Error("target is required (e.g., USD)");

    // 1) list from Appwrite (be lenient on year type -> filter in memory)
    const queries: any[] = [Query.limit(limit)];
    if (category) queries.push(Query.equal("category", category));
    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    let items = resp.documents.map(mapDoc);
    if (typeof yr === "number" && !Number.isNaN(yr)) {
      items = items.filter((d) => typeof d.year === "number" && d.year === yr);
    }

    // 2) fetch FX with base LKR
    const { data } = await axios.get(
      `https://api.exchangerate.host/latest?base=LKR`
    );
    const rate = data?.rates?.[target];
    if (typeof rate !== "number") {
      throw new Error(`Missing FX rate for ${target}`);
    }

    // 3) convert (all stored in LKR)
    const out = items.map((it) => ({
      ...it,
      amount: +(it.amount * rate).toFixed(2),
      currency: target,
    }));

    return JSON.stringify({ target, items: out });
  },
  {
    name: "convert_taxes_by_filters",
    description:
      "List taxes (filtered by optional category/year) and convert them from LKR to target (e.g., USD).",
    schema: z
      .object({
        category: z.union([z.string(), z.null()]).optional(),
        year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
        target: z.string().length(3),
        limit: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      })
      .passthrough(), // tolerate extra fields
  }
);
const fetchRatesTool = tool(
  async (raw: { base: string }) => {
    const b = (raw.base || "LKR").toUpperCase();
    const now = Date.now();
    if (fxCache.base === b && fxCache.ts && fxCache.rates && now - fxCache.ts < FX_TTL_MS) {
      return JSON.stringify({ base: fxCache.base, rates: fxCache.rates, cached: true });
    }
    const { data } = await axios.get(
      `https://api.exchangerate.host/latest?base=${encodeURIComponent(b)}`
    );
    if (!data?.rates || typeof data.rates !== "object") {
      throw new Error("FX provider response invalid");
    }
    fxCache = { base: data.base, rates: data.rates, ts: now };
    return JSON.stringify({ base: data.base, rates: data.rates, cached: false });
  },
  {
    name: "fetch_currency_rates",
    description:
      'Fetch latest FX rates for a base currency (e.g., "LKR"). Returns { base, rates, cached }.',
    schema: z.object({ base: z.string().min(3).max(3) }),
  }
);

/// all amounts are stored in LKR; convert to target using provided rates
const convertTaxesTool = tool(
  async (raw: {
    items: Array<{
      id?: string;
      name?: string;
      category?: string;
      amount?: number | string;
      year?: number | string | null;
      currency?: string | null; // ignored as source; all are LKR by design
      [k: string]: unknown;
    }>;
    base?: string;
    target: string;
    rates: Record<string, number | string>;
  }): Promise<string> => {
    const b = (raw.base || "LKR").toUpperCase();
    const t = (raw.target || "").toUpperCase();
    if (!t) throw new Error("target currency is required");

    // Coerce rates to numbers
    const rates: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.rates || {})) {
      const num = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(num)) rates[k.toUpperCase()] = num;
    }

    const tRate = rates[t];
    if (typeof tRate !== "number") throw new Error(`Missing FX rate for ${t}`);

    // All items are stored in LKR. Need the LKR rate if base != LKR.
    const sRate = b === "LKR" ? 1 : rates["LKR"];
    if (typeof sRate !== "number") throw new Error("Missing FX rate for LKR");

    const out = (raw.items || []).map((it) => {
      const amt = typeof it.amount === "number" ? it.amount : Number(it.amount);
      const safeAmt = Number.isFinite(amt) ? amt : 0;
      const baseAmt = safeAmt / sRate;  // LKR -> base
      const tgtAmt = baseAmt * tRate;   // base -> target
      return {
        id: String(it.id ?? ""),
        name: String(it.name ?? ""),
        category: String(it.category ?? ""),
        year:
          it.year === undefined || it.year === null || it.year === ""
            ? undefined
            : Number(it.year),
        amount: +tgtAmt.toFixed(2),
        currency: t,
      };
    });

    return JSON.stringify({ target: t, items: out });
  },
  {
    name: "convert_tax_items",
    description:
      "Convert items (stored in LKR) to target using provided rates. Accepts loose item shapes; coerces numbers.",
    schema: z.object({
      items: z.array(
        z.object({
          id: z.union([z.string(), z.undefined()]).optional(),
          name: z.union([z.string(), z.undefined()]).optional(),
          category: z.union([z.string(), z.undefined()]).optional(),
          amount: z.union([z.coerce.number(), z.string()]),
          year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
          currency: z.union([z.string(), z.null()]).optional(),
        })
      ),
      base: z.string().length(3).default("LKR").optional(),
      target: z.string().length(3),
      rates: z.record(z.union([z.coerce.number(), z.string()])),
    }),
  }
);




// ---------- LLM + Agent (use prompt, not messages) ----------


console.log("[OPENAI] key prefix:", process.env.OPENAI_API_KEY?.slice(0, 12));
console.log("[OPENAI] project key?", process.env.OPENAI_API_KEY?.startsWith("sk-proj-"));


const llm = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
    You are a currency conversion assistant for a tax app.
    The data store has NO currency column; all stored amounts are LKR.
    Workflow:
      (1) call list_taxes with user filters (category/year/amount),
      (2) call fetch_currency_rates with base "LKR",
      (3) call convert_tax_items to the requested target (assume source = LKR).
    Output: Return compact JSON with keys:
      - target: string (e.g., "USD")
      - items: array of objects with keys id, name, category, year, amount, currency
    `
  ],
  // (optional) You can also add chat history if you want:
  // new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],

  // REQUIRED for tool-calling agents:
  new MessagesPlaceholder("agent_scratchpad"),
]);





async function buildUserAgent(): Promise<AgentExecutor> {
  const agent = await createToolCallingAgent({
    llm,
    tools: [convertByFiltersTool],
    prompt,
  });
  return new AgentExecutor({
    agent,
    tools: [listTaxesTool, fetchRatesTool, convertTaxesTool],
  });
}

// ---------- Agent endpoint ----------
app.post('/agent', async (req, res) => {
  try {
    const input = String(req.body?.input ?? '');
    if (!input) return res.status(400).json({ error: 'Missing input' });

    const exec = await buildUserAgent();
    const result = await exec.invoke({ input });

    // Normalize possible shapes from different LC versions
    let out: any = (result as any).output ?? (result as any).output_text ?? result;

    // If it's a string, try to parse JSON
    if (typeof out === 'string') {
      try { out = JSON.parse(out); } catch {}
    }

    // If it's still not an object with items, put something useful
    if (!out || typeof out !== 'object') {
      out = { target: null, items: [], raw: result };
    }

    res.json({ output: out });
  } catch (e: any) {
    console.error("[/agent] ERROR >>>");
    console.error("message:", e?.message);
    console.error("status :", e?.status || e?.response?.status);
    console.error("data   :", e?.response?.data);
    console.error("stack  :", e?.stack);
    return res.status(500).json({ error: e?.message || 'Agent error' });
  }
});

app.post('/convert', async (req, res) => {
  try {
    const { amount, target } = req.body as { amount: number; target: string };
    if (typeof amount !== 'number' || !target) {
      return res.status(400).json({ error: 'amount:number and target:string required' });
    }
    const { data } = await axios.get('https://api.exchangerate.host/latest?base=LKR');
    const rate = data?.rates?.[target.toUpperCase()];
    if (typeof rate !== 'number') return res.status(400).json({ error: `Missing FX rate for ${target}` });
    res.json({ base: 'LKR', target: target.toUpperCase(), rate, amount, converted: +(amount * rate).toFixed(2) });
  } catch (e: any) {
    console.error("[/convert] ERR:", e?.response?.data || e?.message || e);
    res.status(500).json({ error: e?.message || 'convert failed' });
  }
});




// ---------- Admin seed (simple header secret for dev) ----------
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-me';
function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (req.header('X-Admin-Secret') !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

app.post('/admin/tax', requireAdmin, async (req, res) => {
  try {
    const payload = z
      .object({
        name: z.string(),
        category: z.string(),
        amount: z.number(),
        currency: z.string().length(3).default('LKR'),
        year: z.number(),
      })
      .parse(req.body);

    const doc = await db.createDocument(DB_ID, TAXES, ID.unique(), {
      ...payload,
      currency: (payload.currency || 'LKR').toUpperCase(),
      createdAt: new Date().toISOString(),
    });
    res.json(mapDoc(doc));
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Bad payload' });
  }
});
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---------- Start ----------
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});
