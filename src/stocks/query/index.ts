import { useQuery } from "@tanstack/react-query";

import { fetchStockItems } from "../api";
import { stocksQueryKey } from "./keys";

export * from "../api";
export * from "./keys";

export function useStocksQuery() {
  return useQuery({
    queryKey: stocksQueryKey,
    queryFn: fetchStockItems,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
