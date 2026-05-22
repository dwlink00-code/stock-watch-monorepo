import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http.js";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new HttpError(404, "Route not found"));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  const message =
    error instanceof Error ? error.message : "Unexpected server error";

  return res.status(500).json({
    message,
  });
}
