import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
import domainRoutes from "./routes/domainRoutes.js";
import txRoutes from "./routes/txnsRoutes.js";
import opsRoutes from "./routes/opsRoutes.js";

import { startListener } from "./workers/listeners.js";

app.use(cors());
// app.options("*", cors());

app.use(express.json());

app.get("/ping", (req, res) => res.json({ status: "pong" }));

// routes
app.use("/api/domains", domainRoutes);
app.use("/api/tx", txRoutes);
app.use("/api/ops", opsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  // start blockchain listener worker
  await startListener();
});