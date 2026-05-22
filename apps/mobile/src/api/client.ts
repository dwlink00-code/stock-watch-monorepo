import axios from "axios";
import { Platform } from "react-native";

import type {
  Alert,
  AuthResponse,
  StockDetailsResponse,
  StocksResponse,
} from "../types/api";

const fallbackBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? fallbackBaseUrl,
  timeout: 15000,
});

export async function login(email: string, password: string) {
  const response = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await apiClient.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function fetchStocks() {
  const response = await apiClient.get<StocksResponse>("/stocks");
  return response.data;
}

export async function fetchStockDetails(symbol: string) {
  const response = await apiClient.get<StockDetailsResponse>(`/stocks/${symbol}`);
  return response.data;
}

export async function fetchAlerts(token: string) {
  const response = await apiClient.get<{ alerts: Alert[] }>("/alerts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.alerts;
}

export async function createAlert(
  token: string,
  input: { symbol: string; targetPrice: number },
) {
  const response = await apiClient.post<{ alert: Alert }>(
    "/alerts",
    {
      symbol: input.symbol,
      targetPrice: input.targetPrice,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.alert;
}

export async function registerDeviceToken(
  token: string,
  payload: { deviceToken: string; platform: string },
) {
  await apiClient.post(
    "/devices/token",
    {
      token: payload.deviceToken,
      platform: payload.platform,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
