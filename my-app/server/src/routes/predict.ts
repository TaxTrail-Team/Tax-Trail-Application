import express from "express";
import { predictBudgetTrend, generatePredictionSummary } from "../llm/predict";

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const prediction = await predictBudgetTrend(data);
    res.json(prediction);
  } catch (err: any) {
    console.error("Prediction API Error:", err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// NEW FEATURE: Generate a natural language summary
router.post("/summary", async (req, res) => {
  try {
    const { prediction, data } = req.body;
    const summary = await generatePredictionSummary(prediction, data);
    res.json({ summary });
  } catch (err) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: "Summary generation failed" });
  }
});

export default router;