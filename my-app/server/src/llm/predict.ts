// my-app/server/src/llm/predict.ts
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { llm } from "./langchain";

// Define schema for prediction
const predictionSchema = z.object({
  nextYear: z.number(),
  nextYearPrediction: z.number(),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
});

const parser = StructuredOutputParser.fromZodSchema(predictionSchema);

// ---- Improved Linear Regression (used as fallback) ----
function calculateLinearRegressionPrediction(
  data: { year: number; amount: number }[]
) {
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.year, 0);
  const sumY = data.reduce((s, d) => s + d.amount, 0);
  const sumXY = data.reduce((s, d) => s + d.year * d.amount, 0);
  const sumX2 = data.reduce((s, d) => s + d.year * d.year, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const nextYear = Math.max(...data.map((d) => d.year)) + 1;
  const predicted = Math.round(slope * nextYear + intercept);

  // Calculate R² as confidence
  const meanY = sumY / n;
  const ssTot = data.reduce((s, d) => s + Math.pow(d.amount - meanY, 2), 0);
  const ssRes = data.reduce(
    (s, d) => s + Math.pow(d.amount - (slope * d.year + intercept), 2),
    0
  );
  const r2 = 1 - ssRes / ssTot;

  return {
    nextYear,
    nextYearPrediction: predicted,
    summary: `Based on the historical upward trend from ${data[0].year} to ${
      data[data.length - 1].year
    }, 
    the budget is expected to ${
      slope > 0 ? "increase" : "decrease"
    } moderately.`,
    confidence: Math.max(0.65, Math.min(0.95, r2)),
  };
}

// ---- LLM-Enhanced Prediction ----
export async function predictBudgetTrend(
  historyData: { year: number; amount: number }[]
) {
  try {
    // Step 1: Always compute baseline numeric prediction
    const baseline = calculateLinearRegressionPrediction(historyData);

    // Step 2: Ask LLM to only refine explanation and confidence (not the number)
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an expert financial analyst. Given a baseline numerical prediction,
        generate a short, consistent explanation and refine the confidence slightly (+/- 0.05 max).
        DO NOT change the predicted number.`,
      ],
      [
        "human",
        `Historical Data: {data}
Baseline Prediction: {baseline}

Return JSON:
- nextYear: number
- nextYearPrediction: integer (same as baseline)
- confidence: number between 0 and 1
- summary: concise reasoning under 400 characters
{format}`,
      ],
    ]);

    // ✅ Make model deterministic
    const llmStable = llm.bind({ temperature: 0, max_tokens: 300 });
    const chain = RunnableSequence.from([prompt, llmStable, parser]);

    const output = await chain.invoke({
      data: JSON.stringify(historyData),
      baseline: JSON.stringify(baseline),
      format: parser.getFormatInstructions(),
    });

    // If LLM produces nonsense, use baseline
    if (!output?.nextYearPrediction || isNaN(output.nextYearPrediction)) {
      return baseline;
    }

    // Use baseline number always, keep refined confidence/summary
    return {
      ...baseline,
      summary: output.summary || baseline.summary,
      confidence: output.confidence || baseline.confidence,
    };
  } catch (error) {
    console.error("LLM prediction failed, using fallback:", error);
    return calculateLinearRegressionPrediction(historyData);
  }
}

// ---- Optional: Generate LLM Summary ----
export async function generatePredictionSummary(
  prediction: {
    nextYear: number;
    nextYearPrediction: number;
    confidence: number;
  },
  historyData: { year: number; amount: number }[]
) {
  try {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a financial analyst creating explainable summaries of predictions.",
      ],
      [
        "human",
        `Historical Data: {data}
Prediction:
Next Year: {nextYear}
Predicted Amount: {nextYearPrediction}
Confidence: {confidence}

Generate a 2-3 sentence summary (under 450 characters) explaining the rationale behind this prediction.
{format}`,
      ],
    ]);

    const summarySchema = z.object({
      summary: z.string().min(30).max(450),
    });

    const summaryParser = StructuredOutputParser.fromZodSchema(summarySchema);
    const chain = RunnableSequence.from([prompt, llm, summaryParser]);

    const result = await chain.invoke({
      data: JSON.stringify(historyData),
      nextYear: prediction.nextYear,
      nextYearPrediction: prediction.nextYearPrediction,
      confidence: prediction.confidence,
      format: summaryParser.getFormatInstructions(),
    });

    return result.summary;
  } catch (error) {
    console.error("LLM summary generation failed:", error);
    return "This forecast is derived from past growth trends and statistical patterns.";
  }
}
