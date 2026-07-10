import type { StockListItem, StocksQueryResult, SymbolResult } from "@stocks/types";

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

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred.";
}

export function formatRecommendation(symbolResult: SymbolResult | undefined) {
  const recommendation = symbolResult?.data?.["Recommend.All"];

  return typeof recommendation === "number" ? recommendation.toFixed(2) : "Loading";
}

export function getRecommendationValue(symbolResult: SymbolResult | undefined) {
  const recommendation = symbolResult?.data?.["Recommend.All"];

  return typeof recommendation === "number" ? recommendation : Number.NEGATIVE_INFINITY;
}

export function getRecommendationColor(symbolResult: SymbolResult | undefined) {
  const recommendation = getRecommendationValue(symbolResult);

  if (recommendation > 0.7) {
    return "#6A1B9A";
  }

  if (recommendation > 0.6) {
    return "#006400";
  }

  if (recommendation > 0.5) {
    return "#5AAE61";
  }

  return undefined;
}

export function getSymbolFields(symbolResult: SymbolResult | undefined) {
  return Object.entries(symbolResult?.data ?? {}).sort(([left], [right]) => left.localeCompare(right));
}

export function formatSymbolValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(4);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return JSON.stringify(value);
}
