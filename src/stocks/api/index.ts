import {
  mapStockListItems,
  type StockListItem,
  type StocksQuery,
  type StocksQueryResult,
} from "@stocks";

const stocksQuery: StocksQuery = {
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
    {
      left: "TechRating_1D",
      operation: "in_range",
      right: ["StrongBuy"],
    },
    {
      left: "Perf.Y",
      operation: "in_range",
      right: [100, 400],
    },
    {
      left: "is_primary",
      operation: "equal",
      right: true,
    },
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
                  {
                    expression: {
                      left: "type",
                      operation: "equal",
                      right: "stock",
                    },
                  },
                  {
                    expression: {
                      left: "typespecs",
                      operation: "has",
                      right: ["common"],
                    },
                  },
                ],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [
                  {
                    expression: {
                      left: "type",
                      operation: "equal",
                      right: "stock",
                    },
                  },
                  {
                    expression: {
                      left: "typespecs",
                      operation: "has",
                      right: ["preferred"],
                    },
                  },
                ],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [
                  {
                    expression: {
                      left: "type",
                      operation: "equal",
                      right: "dr",
                    },
                  },
                ],
              },
            },
            {
              operation: {
                operator: "and",
                operands: [
                  {
                    expression: {
                      left: "type",
                      operation: "equal",
                      right: "fund",
                    },
                  },
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
  options: {
    lang: "en",
  },
  price_conversion: {
    to_currency: "usd",
  },
  range: [0, 100],
  sort: {
    sortBy: "Perf.Y",
    sortOrder: "desc",
  },
};

export async function fetchStockItems(): Promise<StockListItem[]> {
  const response = await fetch("https://scanner.tradingview.com/global/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stocksQuery),
  });

  if (!response.ok) {
    throw new Error(`TradingView request failed: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as StocksQueryResult;

  return mapStockListItems(result);
}
