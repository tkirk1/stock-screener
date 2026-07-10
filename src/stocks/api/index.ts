import { mapStockListItems, normalizeSymbolResult } from "@stocks/functions";
import { RawSymbolResult, StockListItem, StocksQueryResult, SymbolResult, } from "@stocks/types";
import { Platform } from "react-native";
import { tradingViewScanRequest } from "@stocks/query/constants";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_STOCK_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:5080" : "http://localhost:5080");

export async function fetchStockItems(): Promise<StockListItem[]> {
  const response = await fetch(`${apiBaseUrl}/api/scan`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tradingViewScanRequest),
  });

  if (!response.ok) {
    throw new Error(`Stock API request failed: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as StocksQueryResult;

  return mapStockListItems(result);
}

export async function fetchSymbolItems(): Promise<SymbolResult[]> {
  const response = await fetch(`${apiBaseUrl}/api/symbols`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Symbols API request failed: ${response.status} ${response.statusText}`);
  }

  return ((await response.json()) as RawSymbolResult[]).map(normalizeSymbolResult);
}
