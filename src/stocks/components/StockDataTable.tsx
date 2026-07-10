import { useMemo, useState, type FC, type ReactElement } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { DataTable, useTheme } from "react-native-paper";
import { StockListItem, SymbolResult, } from "@stocks/types"
import {
  formatRecommendationPercent,
  formatStockPercent,
  formatStockPrice,
  getRecommendationColor,
  getRecommendationValue,
  getStockPerformanceColor,
} from "@stocks/functions";

import { StockExchangeChip } from "./StockExchangeChip";

type StockDataTableProps = {
  compact: boolean;
  stocks: readonly StockListItem[];
  symbolResultsBySymbol: ReadonlyMap<string, SymbolResult>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectStock: (stock: StockListItem) => void;
  emptyState: ReactElement;
};

type SortColumn =
  | "symbol"
  | "company"
  | "exchange"
  | "last"
  | "change"
  | "perfWeek"
  | "perfMonth"
  | "perf3Months"
  | "perf6Months"
  | "perfYtd"
  | "perfYear"
  | "recommendation";

type SortDirection = "ascending" | "descending";

export const StockDataTable: FC<StockDataTableProps> = ({
  compact,
  stocks,
  symbolResultsBySymbol,
  isRefreshing,
  onRefresh,
  onSelectStock,
  emptyState,
}) => {
  const theme = useTheme();
  const tableWidth = compact ? styles.compactTableWidth : styles.tableWidth;
  const [sortColumn, setSortColumn] = useState<SortColumn>("recommendation");
  const [sortDirection, setSortDirection] = useState<SortDirection>("descending");
  const sortedStocks = useMemo(() => {
    const direction = sortDirection === "ascending" ? 1 : -1;
    const stringComparer = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

    const getSortValue = (stock: StockListItem): string | number => {
      switch (sortColumn) {
        case "symbol":
          return stock.id;
        case "company":
          return stock.company.description;
        case "exchange":
          return stock.company.exchange;
        case "last":
          return stock.close;
        case "change":
          return stock.change;
        case "perfWeek":
          return stock.perfWeek;
        case "perfMonth":
          return stock.perfMonth;
        case "perf3Months":
          return stock.perf3Months;
        case "perf6Months":
          return stock.perf6Months;
        case "perfYtd":
          return stock.perfYtd;
        case "perfYear":
          return stock.perfYear;
        case "recommendation":
          return getRecommendationValue(symbolResultsBySymbol.get(stock.id));
      }
    };

    return stocks
      .map((stock, index) => ({ stock, index }))
      .sort((left, right) => {
        const leftValue = getSortValue(left.stock);
        const rightValue = getSortValue(right.stock);
        const comparison =
          typeof leftValue === "string" && typeof rightValue === "string"
            ? stringComparer.compare(leftValue, rightValue)
            : Number(leftValue) - Number(rightValue);

        return comparison === 0 ? left.index - right.index : comparison * direction;
      })
      .map(({ stock }) => stock);
  }, [sortColumn, sortDirection, stocks, symbolResultsBySymbol]);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((currentDirection) => (currentDirection === "ascending" ? "descending" : "ascending"));
      return;
    }

    setSortColumn(column);
    setSortDirection("ascending");
  };

  const getSortDirection = (column: SortColumn) => (sortColumn === column ? sortDirection : undefined);

  return (
    <ScrollView
      horizontal
      style={styles.horizontalScroll}
      contentContainerStyle={styles.horizontalScrollContent}
      showsHorizontalScrollIndicator
    >
      <ScrollView
        style={[styles.tableScroll, stocks.length > 0 && tableWidth]}
        contentContainerStyle={stocks.length === 0 ? styles.emptyTable : undefined}
        nestedScrollEnabled
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        stickyHeaderIndices={stocks.length > 0 ? [0] : undefined}
      >
        {stocks.length === 0 ? (
          emptyState
        ) : (
          <DataTable.Header style={[tableWidth, styles.header, { backgroundColor: theme.colors.elevation.level2 }]}>
            <DataTable.Title
              style={styles.symbolColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("symbol")}
              sortDirection={getSortDirection("symbol")}
            >
              Symbol
            </DataTable.Title>
            <DataTable.Title
              style={styles.companyColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("company")}
              sortDirection={getSortDirection("company")}
            >
              Company
            </DataTable.Title>
            <DataTable.Title
              style={styles.exchangeColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("exchange")}
              sortDirection={getSortDirection("exchange")}
            >
              Exchange
            </DataTable.Title>
            <DataTable.Title
              style={styles.numberColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("last")}
              sortDirection={getSortDirection("last")}
            >
              Last
            </DataTable.Title>
            <DataTable.Title
              style={styles.numberColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("change")}
              sortDirection={getSortDirection("change")}
            >
              Change
            </DataTable.Title>
            {!compact ? (
              <>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perfWeek")}
                  sortDirection={getSortDirection("perfWeek")}
                >
                  1W
                </DataTable.Title>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perfMonth")}
                  sortDirection={getSortDirection("perfMonth")}
                >
                  1M
                </DataTable.Title>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perf3Months")}
                  sortDirection={getSortDirection("perf3Months")}
                >
                  3M
                </DataTable.Title>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perf6Months")}
                  sortDirection={getSortDirection("perf6Months")}
                >
                  6M
                </DataTable.Title>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perfYtd")}
                  sortDirection={getSortDirection("perfYtd")}
                >
                  YTD
                </DataTable.Title>
                <DataTable.Title
                  style={styles.numberColumn}
                  textStyle={styles.startAlignedText}
                  onPress={() => handleSort("perfYear")}
                  sortDirection={getSortDirection("perfYear")}
                >
                  1Y
                </DataTable.Title>
              </>
            ) : null}
            <DataTable.Title
              style={styles.recommendationColumn}
              textStyle={styles.startAlignedText}
              onPress={() => handleSort("recommendation")}
              sortDirection={getSortDirection("recommendation")}
            >
              TA Rating (1D)
            </DataTable.Title>
          </DataTable.Header>
        )}
        {stocks.length > 0 ? (
          <View style={tableWidth}>
            {sortedStocks.map((stock) => {
              const symbolResult = symbolResultsBySymbol.get(stock.id);
              const recommendationColor = getRecommendationColor(symbolResult);

              return (
                <DataTable.Row key={stock.id} onPress={() => onSelectStock(stock)}>
                  <DataTable.Cell style={styles.symbolColumn} textStyle={recommendationColor ? { color: recommendationColor } : undefined}>
                    {stock.id}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.companyColumn} textStyle={recommendationColor ? { color: recommendationColor } : undefined}>
                    {stock.company.description}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.exchangeColumn}>
                    <StockExchangeChip exchange={stock.company.exchange} symbolResult={symbolResult} />
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.numberColumn}>{formatStockPrice(stock.close, stock.currency)}</DataTable.Cell>
                  <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.change) }}>
                    {formatStockPercent(stock.change)}
                  </DataTable.Cell>
                  {!compact ? (
                    <>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perfWeek) }}>
                        {formatStockPercent(stock.perfWeek)}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perfMonth) }}>
                        {formatStockPercent(stock.perfMonth)}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perf3Months) }}>
                        {formatStockPercent(stock.perf3Months)}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perf6Months) }}>
                        {formatStockPercent(stock.perf6Months)}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perfYtd) }}>
                        {formatStockPercent(stock.perfYtd)}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perfYear) }}>
                        {formatStockPercent(stock.perfYear)}
                      </DataTable.Cell>
                    </>
                  ) : null}
                  <DataTable.Cell style={styles.recommendationColumn} textStyle={recommendationColor ? { color: recommendationColor } : undefined}>
                    {formatRecommendationPercent(symbolResult)}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyTable: {
    flexGrow: 1,
  },
  tableScroll: {
    flex: 1,
    overflow: "scroll",
  },
  horizontalScroll: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexGrow: 1,
  },
  tableWidth: {
    minWidth: 1450,
  },
  compactTableWidth: {
    minWidth: 800,
  },
  header: {
    zIndex: 1,
  },
  startAlignedText: {
    flex: 1,
    textAlign: "left",
  },
  symbolColumn: {
    flex: 1.1,
    justifyContent: "flex-start",
  },
  companyColumn: {
    flex: 2.4,
    justifyContent: "flex-start",
  },
  exchangeColumn: {
    flex: 1.15,
    justifyContent: "flex-start",
  },
  numberColumn: {
    flex: 1.1,
    justifyContent: "flex-start",
  },
  recommendationColumn: {
    flex: 1.25,
    justifyContent: "flex-start",
  },
});
