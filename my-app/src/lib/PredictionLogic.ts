// // Simple linear prediction logic for next year
// export const predictNextYearBudget = (data: any[], sector: string) => {
//   const sectorData = data.filter(d => d.sector === sector);
//   if (sectorData.length < 2) return null;

//   const years = sectorData.map(d => d.year);
//   const budgets = sectorData.map(d => d.budget);

//   const n = years.length;
//   const avgX = years.reduce((a, b) => a + b, 0) / n;
//   const avgY = budgets.reduce((a, b) => a + b, 0) / n;

//   const slope = years.map((x, i) => (x - avgX) * (budgets[i] - avgY))
//                     .reduce((a, b) => a + b) /
//                     years.map(x => (x - avgX) ** 2).reduce((a, b) => a + b);
//   const intercept = avgY - slope * avgX;

//   const nextYear = Math.max(...years) + 1;
//   const prediction = slope * nextYear + intercept;
//   return { nextYear, prediction: Math.round(prediction) };
// };

// my-app/src/lib/PredictionLogic.ts
export const predictNextYearBudget = (data: any[], sector: string) => {
  const sectorData = data.filter((d) => d.sector === sector);
  if (sectorData.length < 2) return null;

  const years = sectorData.map((d) => d.year);
  const budgets = sectorData.map((d) => d.budget);
  const n = years.length;

  // Calculate averages
  const meanX = years.reduce((a, b) => a + b, 0) / n;
  const meanY = budgets.reduce((a, b) => a + b, 0) / n;

  // Compute slope and intercept
  const slope =
    years
      .map((x, i) => (x - meanX) * (budgets[i] - meanY))
      .reduce((a, b) => a + b) /
    years.map((x) => Math.pow(x - meanX, 2)).reduce((a, b) => a + b);
  const intercept = meanY - slope * meanX;

  const nextYear = Math.max(...years) + 1;
  const prediction = Math.max(0, slope * nextYear + intercept);

  const growthRate = slope / meanY;
  const confidence = Math.max(
    0.6,
    Math.min(0.95, 1 - Math.abs(growthRate) * 2)
  );

  return {
    nextYear,
    prediction: Math.round(prediction),
    confidence,
  };
};

// import axios from "axios";

// // Hybrid client-side prediction logic
// export const predictNextYearBudget = async (data: any[], sector: string) => {
//   const sectorData = data.filter(d => d.sector === sector);
//   if (sectorData.length < 2) return null;

//   try {
//     // Call backend LLM prediction
//     const response = await axios.post("http://localhost:3001/api/predict", {
//       historyData: sectorData.map(d => ({ year: d.year, amount: d.budget }))
//     });
//     return response.data; // { nextYear, nextYearPrediction, summary, confidence }
//   } catch (error) {
//     console.warn("Falling back to local regression:", error);

//     // Fallback local regression
//     const years = sectorData.map(d => d.year);
//     const budgets = sectorData.map(d => d.budget);
//     const n = years.length;
//     const avgX = years.reduce((a, b) => a + b, 0) / n;
//     const avgY = budgets.reduce((a, b) => a + b, 0) / n;
//     const slope =
//       years.map((x, i) => (x - avgX) * (budgets[i] - avgY)).reduce((a, b) => a + b) /
//       years.map(x => (x - avgX) ** 2).reduce((a, b) => a + b);
//     const intercept = avgY - slope * avgX;
//     const nextYear = Math.max(...years) + 1;
//     const prediction = slope * nextYear + intercept;

//     return {
//       nextYear,
//       nextYearPrediction: Math.round(prediction),
//       confidence: 0.7,
//       summary: "Based on local regression, the budget is expected to follow a similar trend."
//     };
//   }
// };
