import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { alertsRouter } from "./routes/alerts.js";
import { authRouter } from "./routes/auth.js";
import { devicesRouter } from "./routes/devices.js";
import { healthRouter } from "./routes/health.js";
import { stocksRouter } from "./routes/stocks.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.WEB_ORIGIN === "*" ? true : env.WEB_ORIGIN,
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "stock-watch-api",
      status: "running",
    });
  });

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/stocks", stocksRouter);
  app.use("/alerts", requireAuth, alertsRouter);
  app.use("/devices", requireAuth, devicesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
