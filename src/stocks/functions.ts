import type { StockListItem, StocksQueryResult } from "@stocks/types";

export function mapStockListItems(result: StocksQueryResult): StockListItem[] {
  return result.data.map((stock) => {
    const [
      company,
      close,
      type,
      typespecs,
      pricescale,
      minmov,
      fractional,
      minmove2,
      currency,
      change,
      perfWeek,
      perfMonth,
      perf3Months,
      perf6Months,
      perfYtd,
      perfYear,
      perf5Years,
      perf10Years,
      perfAll,
      volatilityWeek,
      volatilityMonth,
    ] = stock.d;

    return {
      id: stock.s,
      name: company.name || stock.s,
      description: company.description || `${company.exchange} ${company.type}`,
      company,
      close,
      type,
      typespecs,
      pricescale,
      minmov,
      fractional,
      minmove2,
      currency,
      change,
      perfWeek,
      perfMonth,
      perf3Months,
      perf6Months,
      perfYtd,
      perfYear,
      perf5Years,
      perf10Years,
      perfAll,
      volatilityWeek,
      volatilityMonth,
    };
  });
}
