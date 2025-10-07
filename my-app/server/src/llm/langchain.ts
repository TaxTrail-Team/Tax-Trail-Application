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
  const parser = StructuredOutputParser.fromZodSchema(schema);

  const systemText = [
    "Extract the most current exchange rate for 1 unit of the base currency in terms of the target currency from the provided web search results.",
    "Return JSON only that matches the schema. Choose one number.",
  ].join("\n");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemText],
    ["human", "Base: {base}\nTarget: {target}\nResults:\n{results}\n\n{format}"],
  ]);

  const chain = RunnableSequence.from([prompt, llm, parser]);
  const out = await chain.invoke({
    base,
    target,
    results: typeof serpResults === "string" ? serpResults : JSON.stringify(serpResults),
    format: parser.getFormatInstructions(),
  });

  if (typeof out?.rate !== "number" || !isFinite(out.rate)) {
    throw new Error("LLM failed to extract a numeric rate");
  }
  return { rate: out.rate, source: out.source ?? "Google (SerpAPI via LangChain)" };
}
