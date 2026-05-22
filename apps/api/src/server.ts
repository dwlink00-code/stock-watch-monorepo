import { createServer } from "node:http";

import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createApp } from "./app.js";
import { startAlertWorker } from "./services/alerts.js";

const app = createApp();
const server = createServer(app);
const stopAlertWorker = startAlertWorker();

server.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
});

async function shutdown() {
  stopAlertWorker();
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
