import { useQuery } from "@tanstack/react-query";

import { fetchStockItems, fetchSymbolItems } from "@stocks/api";
import { stocksQueryKey, symbolsQueryKey } from "@stocks/query/keys";

export * from "@stocks/api";
export * from "@stocks/query/keys";

export function useStocksQuery() {
  return useQuery({
    queryKey: stocksQueryKey,
    queryFn: fetchStockItems,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useSymbolsQuery(enabled: boolean = false) {
  return useQuery({
    queryKey: symbolsQueryKey,
    queryFn: fetchSymbolItems,
    enabled: enabled,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
