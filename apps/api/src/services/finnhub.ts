import axios from "axios";
import { z } from "zod";

import { env } from "../config/env.js";
import { defaultStocks } from "../constants/defaultStocks.js";

const quoteSchema = z.object({
  c: z.number(),
  d: z.number().nullable().optional(),
  dp: z.number().nullable().optional(),
  h: z.number(),
  l: z.number(),
  o: z.number(),
  pc: z.number(),
  t: z.number(),
});

const candlesSchema = z.object({
  c: z.array(z.number()),
  h: z.array(z.number()),
  l: z.array(z.number()),
  o: z.array(z.number()),
  s: z.string(),
  t: z.array(z.number()),
  v: z.array(z.number()),
});

const client = axios.create({
  baseURL: env.FINNHUB_BASE_URL,
  timeout: 10000,
});

export type Quote = {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
};

export type CandlePoint = {
  timestamp: number;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
};

export async function getQuote(symbol: string): Promise<Quote> {
  const response = await client.get("/quote", {
    params: {
      symbol,
      token: env.FINNHUB_API_KEY,
    },
  });

  const quote = quoteSchema.parse(response.data);

  return {
    symbol,
    currentPrice: quote.c,
    change: quote.d ?? 0,
    percentChange: quote.dp ?? 0,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    previousClose: quote.pc,
    timestamp: quote.t,
  };
}

export async function getQuotesForDefaultStocks() {
  return Promise.all(defaultStocks.map((symbol) => getQuote(symbol)));
}

export async function getRecentCandles(symbol: string) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 60 * 60 * 24 * 30;

  try {
    const response = await client.get("/stock/candle", {
      params: {
        symbol,
        // Finnhub's free tier reliably supports daily candles.
        resolution: "D",
        from: thirtyDaysAgo,
        to: now,
        token: env.FINNHUB_API_KEY,
      },
    });

    const candles = candlesSchema.safeParse(response.data);

    if (!candles.success || candles.data.s !== "ok") {
      return [];
    }

    return candles.data.c.map<CandlePoint>((close, index) => ({
      timestamp: candles.data.t[index] ?? 0,
      close,
      high: candles.data.h[index] ?? close,
      low: candles.data.l[index] ?? close,
      open: candles.data.o[index] ?? close,
      volume: candles.data.v[index] ?? 0,
    }));
  } catch (error) {
    console.warn(`Unable to load candle data for ${symbol}`, error);
    return [];
  }
}
