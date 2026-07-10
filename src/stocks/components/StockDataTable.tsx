import type { FC, ReactElement } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { DataTable, useTheme } from "react-native-paper";
import { StockListItem, SymbolResult, } from "@stocks/types"
import { formatRecommendationPercent, formatStockPercent, formatStockPrice } from "@stocks/functions";
import { getRecommendationColor, getStockPerformanceColor } from "@stocks/functions";

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
              <DataTable.Title style={styles.symbolColumn} textStyle={styles.startAlignedText}>Symbol</DataTable.Title>
              <DataTable.Title style={styles.companyColumn} textStyle={styles.startAlignedText}>Company</DataTable.Title>
              <DataTable.Title style={styles.exchangeColumn} textStyle={styles.startAlignedText}>Exchange</DataTable.Title>
              <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>Last</DataTable.Title>
              <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>Change</DataTable.Title>
              {!compact ? (
                <>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>1W</DataTable.Title>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>1M</DataTable.Title>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>3M</DataTable.Title>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>6M</DataTable.Title>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>YTD</DataTable.Title>
                  <DataTable.Title style={styles.numberColumn} textStyle={styles.startAlignedText}>1Y</DataTable.Title>
                </>
              ) : null}
              <DataTable.Title style={styles.recommendationColumn} textStyle={styles.startAlignedText}>TA Rating (1D)</DataTable.Title>
          </DataTable.Header>
        )}
        {stocks.length > 0 ? (
          <View style={tableWidth}>
            {stocks.map((stock) => {
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
