import "dotenv/config";
import express from "express";
import cors from "cors";

import fxRouter from "./routes/fx";
import taxesRouter from "./routes/taxes";
import predictRouter from "./routes/predict";


const app = express();
app.use(cors());
app.use(express.json());

// Health first
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Domain routes
app.use(fxRouter);
app.use(taxesRouter);
app.use(predictRouter);

// Start
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
