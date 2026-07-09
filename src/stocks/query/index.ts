import { useQuery } from "@tanstack/react-query";

import { fetchStockItems } from "@stocks/api";
import { stocksQueryKey } from "@stocks/query/keys";

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
