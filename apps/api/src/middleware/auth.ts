import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http.js";
import { verifyAccessToken } from "../utils/jwt.js";

export type AuthenticatedRequest = Request & {
  auth: {
    userId: string;
    email: string;
    name: string;
  };
};

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization header is required"));
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);

    (req as AuthenticatedRequest).auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired token"));
  }
}
