import type { StockListItem, StocksQueryResult } from "@stocks/types";

export function mapStockListItems(result: StocksQueryResult): StockListItem[] {
  return result.data.map((stock) => {
    const company = stock.d[0];

    return {
      id: stock.s,
      name: company.name || stock.s,
      description: company.description || `${company.exchange} ${company.type}`,
    };
  });
}
