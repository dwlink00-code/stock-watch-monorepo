export const defaultStocks = [
  "AAPL",
  "AMZN",
  "GOOGL",
  "MSFT",
  "META",
  "NVDA",
  "NFLX",
  "TSLA",
] as const;

export type DefaultStockSymbol = (typeof defaultStocks)[number];
