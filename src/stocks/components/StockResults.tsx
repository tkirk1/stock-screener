import type { FC, ReactElement } from "react";
import { StockListItem, SymbolResult } from "@stocks/types";
import { StockDataTable } from "./StockDataTable";
import { StockList } from "./StockList";

type StockResultsProps = {
  useDataTable: boolean;
  stocks: readonly StockListItem[];
  symbolResultsBySymbol: ReadonlyMap<string, SymbolResult>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectStock: (stock: StockListItem) => void;
  emptyState: ReactElement;
};

export const StockResults: FC<StockResultsProps> = ({ useDataTable, ...props }) => {
  return useDataTable ? <StockDataTable {...props} /> : <StockList {...props} />;
};
