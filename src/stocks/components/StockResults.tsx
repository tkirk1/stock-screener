import type { FC, ReactElement } from "react";
import { StockListItem, SymbolResult } from "@stocks/types";
import { StockDataTable } from "./StockDataTable";
import { StockList } from "./StockList";

type StockResultsProps = {
  displayMode: "list" | "compact-table" | "full-table";
  stocks: readonly StockListItem[];
  symbolResultsBySymbol: ReadonlyMap<string, SymbolResult>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectStock: (stock: StockListItem) => void;
  emptyState: ReactElement;
};

export const StockResults: FC<StockResultsProps> = ({ displayMode, ...props }) => {
  if (displayMode === "list") {
    return <StockList {...props} />;
  }

  return <StockDataTable compact={displayMode === "compact-table"} {...props} />;
};
