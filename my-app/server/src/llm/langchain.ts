import { SerpAPI } from "@langchain/community/tools/serpapi";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { ENV } from "../config/env";

export const serpTool = ENV.SERPAPI_API_KEY
  ? new SerpAPI(ENV.SERPAPI_API_KEY, { location: "Sri Lanka", hl: "en" })
  : null;

export const llm = new ChatGroq({
  apiKey: ENV.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

export async function getGoogleRateViaLangChain(
  base: string,
  target: string
): Promise<{ rate: number; source: string }> {
  if (!serpTool) throw new Error("SERPAPI_API_KEY not set");

  const query = `1 ${base} to ${target} exchange rate`;
  const serpResults = await serpTool.invoke(query);

  const schema = z.object({
    rate: z.number(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  });

  const systemText = [
    "Extract the most current exchange rate for 1 unit of the base currency in terms of the target currency from the provided web search results.",
    "Return ONLY a JSON object with this exact structure: {\"rate\": number, \"source\": string (optional), \"confidence\": number 0-1 (optional)}",
    "Choose one number. No additional text.",
  ].join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemText],
    ["human", "Base: {base}\nTarget: {target}\nResults:\n{results}"],
  ]);

  const chain = RunnableSequence.from([prompt, llm]);
  const response = await chain.invoke({
    base,
    target,
    results: typeof serpResults === "string" ? serpResults : JSON.stringify(serpResults),
  });

  const content = typeof response.content === "string" ? response.content : String(response.content);
  const jsonMatch = content.match(/\{[^}]+\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  const out = schema.parse(JSON.parse(jsonStr));

  if (typeof out?.rate !== "number" || !isFinite(out.rate)) {
    throw new Error("LLM failed to extract a numeric rate");
  }
  return { rate: out.rate, source: out.source ?? "Google (SerpAPI via LangChain)" };
}

// AI-Powered Anomaly Analysis
export async function analyzeAnomaliesWithAI(data: {
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
}) {
  // Check if GROQ API key is available
  if (!ENV.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Please set it in your .env file.");
  }

  console.log("[analyzeAnomaliesWithAI] Starting analysis...");
  console.log("[analyzeAnomaliesWithAI] Data points:", data.yearlyData.length);

  // Schema for validation (not used with StructuredOutputParser)
  const schema = z.object({
    insights: z.array(
      z.object({
        year: z.number(),
        explanation: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        recommendedActions: z.array(z.string()),
      })
    ),
    overallTrend: z.string(),
    prediction: z.object({
      nextYear: z.number(),
      confidence: z.enum(["low", "medium", "high"]),
      reasoning: z.string(),
    }),
    keyFindings: z.array(z.string()),
    risks: z.array(z.string()),
    opportunities: z.array(z.string()),
  });

  console.log("[analyzeAnomaliesWithAI] Schema created");

  const systemText = [
    "You are a senior financial analyst specializing in budget anomaly detection and trend analysis.",
    "Analyze the provided yearly tax/budget data and identify patterns, anomalies, and insights.",
    "Focus on:",
    "- Explaining WHY anomalies occurred (provide business context)",
    "- Identifying trends and patterns",
    "- Making actionable predictions",
    "- Recommending specific actions",
    "Be specific, actionable, and insightful. Use financial analysis best practices.",
    "",
    "Return ONLY valid JSON with these fields:",
    "- insights: array of objects with year, explanation, severity (low/medium/high), and recommendedActions",
    "- overallTrend: string describing the overall pattern",
    "- prediction: object with nextYear (number), confidence (low/medium/high), and reasoning",
    "- keyFindings: array of key insight strings",
    "- risks: array of identified risk strings",
    "- opportunities: array of opportunity strings",
  ].join("\n");

  const humanText = [
    "Analyze this budget data:",
    "",
    "Average: {mean} LKR",
    "Anomaly Threshold: {threshold}%",
    "Category: {category}",
    "",
    "Yearly Breakdown:",
    "{yearlyData}",
    "",
    "Provide:",
    "1. Detailed explanation for each anomaly year",
    "2. Overall trend analysis",
    "3. Prediction for next year with reasoning",
    "4. Key findings (3-5 points)",
    "5. Identified risks",
    "6. Optimization opportunities",
  ].join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemText],
    ["human", humanText],
  ]);

  // Format yearly data for the prompt
  const yearlyDataText = data.yearlyData
    .map(
      (y) =>
        `${y.year}: ${y.total.toLocaleString()} LKR (${y.percentChange >= 0 ? "+" : ""}${y.percentChange.toFixed(1)}% change, ${y.deviation >= 0 ? "+" : ""}${y.deviation.toFixed(1)}% from mean) ${
          y.isHighAnomaly ? "[HIGH ANOMALY]" : y.isLowAnomaly ? "[LOW ANOMALY]" : ""
        } - ${y.count} items`
    )
    .join("\n");

  const chain = RunnableSequence.from([prompt, llm]);

  console.log("[analyzeAnomaliesWithAI] Invoking LLM chain...");

  try {
    const response = await chain.invoke({
      mean: data.mean.toLocaleString(),
      threshold: data.deviationThreshold,
      category: data.category || "All categories",
      yearlyData: yearlyDataText,
    });

    const content = typeof response.content === "string" ? response.content : String(response.content);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    const result = schema.parse(JSON.parse(jsonStr));

    console.log("[analyzeAnomaliesWithAI] LLM analysis complete");
    return result;
  } catch (error: any) {
    console.error("[analyzeAnomaliesWithAI] LLM Error:", error.message);
    console.error("[analyzeAnomaliesWithAI] Stack:", error.stack);
    throw new Error(`AI Analysis failed: ${error.message}`);
  }
}

// Generate Executive Summary
export async function generateExecutiveSummary(data: {
  yearlyData: Array<{ year: number; total: number; count: number }>;
  mean: number;
  topAnomalies: Array<{ year: number; type: string; deviation: number }>;
  category?: string;
}) {
  // Check if GROQ API key is available
  if (!ENV.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Please set it in your .env file.");
  }

  console.log("[generateExecutiveSummary] Starting summary generation...");

  const systemText = [
    "You are an executive report writer for financial analytics.",
    "Create a concise, professional executive summary (3-4 paragraphs) suitable for C-level executives.",
    "Focus on business impact, trends, and strategic recommendations.",
    "Use clear, confident language.",
  ].join("\n");

  // Pre-compute all values to avoid template conflicts
  const avgBudget = `${data.mean.toLocaleString()} LKR`;
  const period = `${data.yearlyData[data.yearlyData.length - 1]?.year} - ${data.yearlyData[0]?.year}`;
  const category = data.category || "All";
  const anomaliesList = data.topAnomalies
    .map((a) => `- ${a.year}: ${a.deviation >= 0 ? "+" : ""}${a.deviation.toFixed(1)}% deviation (${a.type})`)
    .join("\n");

  const humanText = [
    "Create an executive summary for this budget analysis:",
    "",
    "Average Budget: {avgBudget}",
    "Analysis Period: {period}",
    "Category: {category}",
    "",
    "Top Anomalies:",
    "{anomaliesList}",
    "",
    "Write a professional executive summary covering:",
    "1. Overview of budget trends",
    "2. Key anomalies and their significance",
    "3. Strategic recommendations",
  ].join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemText],
    ["human", humanText],
  ]);

  const chain = RunnableSequence.from([prompt, llm]);

  console.log("[generateExecutiveSummary] Invoking LLM chain...");

  try {
    const result = await chain.invoke({
      avgBudget,
      period,
      category,
      anomaliesList,
    });
    console.log("[generateExecutiveSummary] Summary generated successfully");
    return typeof result.content === "string" ? result.content : String(result.content);
  } catch (error: any) {
    console.error("[generateExecutiveSummary] LLM Error:", error.message);
    console.error("[generateExecutiveSummary] Stack:", error.stack);
    throw new Error(`Executive Summary generation failed: ${error.message}`);
  }
}
