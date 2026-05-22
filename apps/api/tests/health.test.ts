import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/stock_watch";
process.env.JWT_SECRET = "test-secret-value";
process.env.JWT_EXPIRES_IN = "7d";
process.env.FINNHUB_API_KEY = "test-key";
process.env.FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
process.env.ALERT_POLL_INTERVAL_MS = "60000";
process.env.WEB_ORIGIN = "*";

const { createApp } = await import("../src/app.js");

test("GET /health returns ok", async () => {
  const response = await request(createApp()).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});
