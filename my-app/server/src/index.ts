import "dotenv/config";
import express from "express";
import cors from "cors";

import fxRouter from "./routes/fx";
import taxesRouter from "./routes/taxes";

const app = express();
app.use(cors());
app.use(express.json());

// Health first
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));



// Start
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
