import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";

const devicesRouter = Router();

const deviceSchema = z.object({
  token: z.string().min(1),
  platform: z.string().min(1),
});

devicesRouter.post(
  "/token",
  asyncHandler(async (req, res) => {
    const auth = (req as AuthenticatedRequest).auth;
    const input = deviceSchema.parse(req.body);

    const device = await prisma.deviceToken.upsert({
      where: {
        token: input.token,
      },
      update: {
        platform: input.platform,
        userId: auth.userId,
      },
      create: {
        token: input.token,
        platform: input.platform,
        userId: auth.userId,
      },
    });

    res.status(201).json({ device });
  }),
);

export { devicesRouter };
