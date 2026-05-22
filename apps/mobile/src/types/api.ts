export type User = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type StockQuote = {
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

export type StockDetailsResponse = {
  symbol: string;
  quote: StockQuote;
  candles: CandlePoint[];
};

export type StocksResponse = {
  symbols: string[];
  stocks: StockQuote[];
};

export type Alert = {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number | null;
  status: "ACTIVE" | "TRIGGERED";
  triggeredAt: string | null;
  notificationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};
