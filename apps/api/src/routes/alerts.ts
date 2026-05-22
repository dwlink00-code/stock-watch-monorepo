import { AlertStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { type AuthenticatedRequest } from "../middleware/auth.js";
import { getQuote } from "../services/finnhub.js";
import { asyncHandler } from "../utils/http.js";

const alertsRouter = Router();

const createAlertSchema = z.object({
  symbol: z.string().trim().min(1),
  targetPrice: z.coerce.number().positive(),
});

alertsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const auth = (req as AuthenticatedRequest).auth;

    const alerts = await prisma.alert.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ alerts });
  }),
);

alertsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const auth = (req as AuthenticatedRequest).auth;
    const input = createAlertSchema.parse(req.body);
    const symbol = input.symbol.toUpperCase();
    const quote = await getQuote(symbol);

    const alert = await prisma.alert.create({
      data: {
        symbol,
        targetPrice: input.targetPrice,
        currentPrice: quote.currentPrice,
        status: AlertStatus.ACTIVE,
        userId: auth.userId,
      },
    });

    res.status(201).json({ alert });
  }),
);

export { alertsRouter };
