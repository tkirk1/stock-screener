import { mapStockListItems, type StockListItem, type StocksQueryResult } from "@stocks";

const apiBaseUrl = "http://localhost:5080";

export async function fetchStockItems(): Promise<StockListItem[]> {
  const response = await fetch(`${apiBaseUrl}/api/scan`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Stock API request failed: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as StocksQueryResult;

  return mapStockListItems(result);
}
