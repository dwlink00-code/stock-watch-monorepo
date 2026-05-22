import { Router } from "express";
import { z } from "zod";

import { defaultStocks } from "../constants/defaultStocks.js";
import {
  getQuote,
  getQuotesForDefaultStocks,
  getRecentCandles,
} from "../services/finnhub.js";
import { asyncHandler } from "../utils/http.js";

const stocksRouter = Router();

const paramsSchema = z.object({
  symbol: z.string().trim().min(1),
});

stocksRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const stocks = await getQuotesForDefaultStocks();

    res.json({
      symbols: defaultStocks,
      stocks,
    });
  }),
);

stocksRouter.get(
  "/:symbol",
  asyncHandler(async (req, res) => {
    const { symbol } = paramsSchema.parse(req.params);
    const normalizedSymbol = symbol.toUpperCase();

    const [quote, candles] = await Promise.all([
      getQuote(normalizedSymbol),
      getRecentCandles(normalizedSymbol),
    ]);

    res.json({
      symbol: normalizedSymbol,
      quote,
      candles,
    });
  }),
);

export { stocksRouter };
