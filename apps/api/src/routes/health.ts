import { Router } from "express";

import { hasFirebaseConfig } from "../lib/firebase.js";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    notificationsConfigured: hasFirebaseConfig(),
    timestamp: new Date().toISOString(),
  });
});

export { healthRouter };
