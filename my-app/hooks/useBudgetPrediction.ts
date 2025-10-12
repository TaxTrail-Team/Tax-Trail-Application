import { useState } from "react";
import { SERVER } from "../src/lib/api";
import data from "../data/budgets.json";

export function useBudgetPrediction() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function predictNextYear() {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Server error during prediction");
      const result = await res.json();
      setPrediction(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function generateSummary(prediction: any) {
    try {
      const res = await fetch(`${SERVER}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prediction, data }),
      });
      if (!res.ok) throw new Error("Server error during summary generation");
      const result = await res.json();
      return result.summary;
    } catch (err: any) {
      console.error("Summary generation failed:", err);
      return "Unable to generate summary. Please try again.";
    }
  }

  return { prediction, loading, error, predictNextYear, generateSummary };
}
