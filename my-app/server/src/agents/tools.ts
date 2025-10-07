import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db, DB_ID, TAXES } from "../config/appwrite";
import { Query } from "node-appwrite";
import { mapDoc } from "../types/tax";
import { getFxRate } from "../utils/fx";

export const listTaxesTool = tool(
  async (raw: {
    category?: string | null;
    year?: number | string | null;
    amount?: number | string | null;
    limit?: number | string | null;
  }): Promise<string> => {
    const category = (raw.category ?? undefined) || undefined;
    const year = raw.year == null || raw.year === "" ? undefined : Number(raw.year);
    const amount = raw.amount == null || raw.amount === "" ? undefined : Number(raw.amount);
    const limit = raw.limit == null || raw.limit === "" ? 100 : Math.max(1, Math.min(200, Number(raw.limit)));

    const queries: any[] = [Query.limit(limit)];
    if (category) queries.push(Query.equal("category", category));
    if (typeof year === "number" && !Number.isNaN(year)) queries.push(Query.equal("year", year));
    if (typeof amount === "number" && !Number.isNaN(amount)) queries.push(Query.equal("amount", amount));

    const resp = await db.listDocuments(DB_ID, TAXES, queries);
    return JSON.stringify(resp.documents.map(mapDoc));
  },
  {
    name: "list_taxes",
    description: "List tax items filtered by optional {category, year, amount}. All stored amounts are in LKR.",
    schema: z.object({
      category: z.union([z.string(), z.null()]).optional(),
      year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      amount: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      limit: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
    }),
  }
);

export const listAllowedValuesTool = tool(
  async () => {
    const resp = await db.listDocuments(DB_ID, TAXES, [Query.limit(200)]);
    const cats = Array.from(new Set(resp.documents.map((d: any) => d.category))).sort();
    const years = Array.from(
      new Set(resp.documents.map((d: any) => (typeof d.year === "number" ? d.year : Number(d.year))))
    )
      .filter(Boolean)
      .sort((a: number, b: number) => a - b);
    const currencies = ["LKR","USD","EUR","GBP","INR","JPY"]; // or build from your SYMBOLS
    return JSON.stringify({ categories: cats, years, currencies });
  },
  {
    name: "list_allowed_values",
    description: "Returns {categories, years, currencies} for building dropdowns.",
  }
);

export const convertTaxesTool = tool(
  async (raw: {
    items: Array<{ id?: string; name?: string; category?: string; amount?: number | string; year?: number | string | null; }>;
    base?: string;
    target: string;
  }): Promise<string> => {
    const b = (raw.base || "LKR").toUpperCase();
    const t = (raw.target || "").toUpperCase();
    if (!t) throw new Error("target currency is required");

    const rate = await getFxRate(b, t);
    const rate_ts = new Date().toISOString();

    const out = (raw.items || []).map((it) => {
      const amt = typeof it.amount === "number" ? it.amount : Number(it.amount);
      const safeAmt = Number.isFinite(amt) ? amt : 0;
      const tgtAmt = +(safeAmt * rate).toFixed(2);
      return {
        id: String(it.id ?? ""),
        name: String(it.name ?? ""),
        category: String(it.category ?? ""),
        year: it.year == null || it.year === "" ? undefined : Number(it.year),
        base_amount_lkr: safeAmt,
        amount: tgtAmt,
        currency: t,
      };
    });

    return JSON.stringify({ base: b, target: t, rate, rate_ts, items: out });
  },
  {
    name: "convert_tax_items",
    description: "Convert provided items (base default LKR) to target using live FX.",
    schema: z.object({
      items: z.array(
        z.object({
          id: z.union([z.string(), z.undefined()]).optional(),
          name: z.union([z.string(), z.undefined()]).optional(),
          category: z.union([z.string(), z.undefined()]).optional(),
          amount: z.union([z.coerce.number(), z.string()]),
          year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
        })
      ),
      base: z.string().length(3).default("LKR").optional(),
      target: z.string().length(3),
    }),
  }
);

export const convertByFiltersTool = tool(
  async (raw: {
    category?: string | null;
    year?: number | string | null;
    amount?: number | string | null;
    target: string;
    limit?: number | string | null;
  }) => {
    const category = raw.category ?? undefined;
    const yr = raw.year == null || raw.year === "" ? undefined : Number(raw.year);
    const amt = raw.amount == null || raw.amount === "" ? undefined : Number(raw.amount);
    const limit = raw.limit == null || raw.limit === "" ? 100 : Math.max(1, Math.min(200, Number(raw.limit)));
    const target = (raw.target || "").toUpperCase();
    if (!target) throw new Error("target is required (e.g., USD)");

    const queries: any[] = [Query.limit(limit)];
    if (category) queries.push(Query.equal("category", category));
    if (typeof yr === "number" && !Number.isNaN(yr)) queries.push(Query.equal("year", yr));
    if (typeof amt === "number" && !Number.isNaN(amt)) queries.push(Query.equal("amount", amt));

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

    return JSON.stringify({ base: "LKR", target, rate, rate_ts, items: out });
  },
  {
    name: "convert_taxes_by_filters",
    description: "List taxes (optional filters) then convert from LKR to target.",
    schema: z.object({
      category: z.union([z.string(), z.null()]).optional(),
      year: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      amount: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
      target: z.string().length(3),
      limit: z.union([z.coerce.number(), z.string(), z.null()]).optional(),
    }).passthrough(),
  }
);
