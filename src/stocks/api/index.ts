import {
  mapStockListItems,
  type StockListItem,
  type StocksQuery,
  type StocksQueryResult,
  type SymbolResult,
} from "@stocks";
import { Platform } from "react-native";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_STOCK_API_BASE_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:5080" : "http://localhost:5080");

const tradingViewScanRequest = {
  columns: [
    "ticker-view",
    "close",
    "type",
    "typespecs",
    "pricescale",
    "minmov",
    "fractional",
    "minmove2",
    "currency",
    "change",
    "Perf.W",
    "Perf.1M",
    "Perf.3M",
    "Perf.6M",
    "Perf.YTD",
    "Perf.Y",
    "Perf.5Y",
    "Perf.10Y",
    "Perf.All",
    "Volatility.W",
    "Volatility.M",
  ],
  filter: [
    {
      left: "exchange",
      operation: "in_range",
      right: ["ASX", "HKEX", "LSE", "NASDAQ", "NYSE", "AMEX", "TSX", "EURONEXT"],
    },
    { left: "TechRating_1D", operation: "in_range", right: ["StrongBuy"] },
    { left: "Perf.Y", operation: "in_range", right: [100, 400] },
    { left: "is_primary", operation: "equal", right: true },
  ],
  filter2: {
    operator: "and",
    operands: [
      {
        operation: {
          operator: "or",
          operands: [
            {
              operation: {
                operator: "and",
                operands: [
                  { expression: { left: "type", operation: "equal", right: "stock" } },
                  { expression: { left: "typespecs", operation: "has", right: ["common"] } },
                ],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [
                  { expression: { left: "type", operation: "equal", right: "stock" } },
                  { expression: { left: "typespecs", operation: "has", right: ["preferred"] } },
                ],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [{ expression: { left: "type", operation: "equal", right: "dr" } }],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [
                  { expression: { left: "type", operation: "equal", right: "fund" } },
                  {
                    expression: {
                      left: "typespecs",
                      operation: "has_none_of",
                      right: ["etf", "mutual"],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        expression: {
          left: "typespecs",
          operation: "has_none_of",
          right: ["pre-ipo"],
        },
      },
    ],
  },
  ignore_unknown_fields: false,
  markets: [
    "america",
    "australia",
    "canada",
    "france",
    "germany",
    "hongkong",
    "ireland",
    "japan",
    "netherlands",
    "newzealand",
    "switzerland",
    "uk",
  ],
  options: { lang: "en" },
  price_conversion: { to_currency: "usd" },
  range: [0, 100],
  sort: { sortBy: "Perf.Y", sortOrder: "desc" },
} satisfies StocksQuery;

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

type RawSymbolResult = Partial<SymbolResult> & {
  Symbol?: SymbolResult["symbol"];
  StatusCode?: SymbolResult["statusCode"];
  IsSuccessStatusCode?: SymbolResult["isSuccessStatusCode"];
  Data?: SymbolResult["data"];
  RawBody?: SymbolResult["rawBody"];
};

function normalizeSymbolResult(result: RawSymbolResult): SymbolResult {
  return {
    symbol: result.symbol ?? result.Symbol ?? "",
    statusCode: result.statusCode ?? result.StatusCode ?? 0,
    isSuccessStatusCode: result.isSuccessStatusCode ?? result.IsSuccessStatusCode ?? false,
    data: result.data ?? result.Data ?? null,
    rawBody: result.rawBody ?? result.RawBody ?? null,
  };
}
