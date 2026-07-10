import type { FC, ReactElement } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { DataTable, useTheme } from "react-native-paper";
import { StockListItem, SymbolResult, } from "@stocks/types"
import { formatRecommendation, formatStockPercent, formatStockPrice } from "@stocks/functions";
import { getRecommendationColor, getStockPerformanceColor } from "@stocks/functions";

type StockDataTableProps = {
  stocks: readonly StockListItem[];
  symbolResultsBySymbol: ReadonlyMap<string, SymbolResult>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectStock: (stock: StockListItem) => void;
  emptyState: ReactElement;
};

export const StockDataTable: FC<StockDataTableProps> = ({
  stocks,
  symbolResultsBySymbol,
  isRefreshing,
  onRefresh,
  onSelectStock,
  emptyState,
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      style={styles.tableScroll}
      contentContainerStyle={stocks.length === 0 ? styles.emptyTable : undefined}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      stickyHeaderIndices={stocks.length > 0 ? [0] : undefined}
    >
      {stocks.length === 0 ? (
        emptyState
      ) : (
        <DataTable.Header style={[styles.tableWidth, styles.header, { backgroundColor: theme.colors.elevation.level2 }]}>
            <DataTable.Title style={styles.symbolColumn}>Symbol</DataTable.Title>
            <DataTable.Title style={styles.companyColumn}>Company</DataTable.Title>
            <DataTable.Title style={styles.exchangeColumn}>Exchange</DataTable.Title>
            <DataTable.Title numeric style={styles.numberColumn}>Last</DataTable.Title>
            <DataTable.Title numeric style={styles.numberColumn}>Change</DataTable.Title>
            <DataTable.Title numeric style={styles.numberColumn}>1Y</DataTable.Title>
            <DataTable.Title numeric style={styles.recommendationColumn}>Rating</DataTable.Title>
        </DataTable.Header>
      )}
      {stocks.length > 0 ? (
          <View style={styles.tableWidth}>
            {stocks.map((stock) => {
              const symbolResult = symbolResultsBySymbol.get(stock.id);
              const recommendationColor = getRecommendationColor(symbolResult);

              return (
                <DataTable.Row key={stock.id} onPress={() => onSelectStock(stock)}>
                  <DataTable.Cell style={styles.symbolColumn}>{stock.id}</DataTable.Cell>
                  <DataTable.Cell style={styles.companyColumn}>{stock.name}</DataTable.Cell>
                  <DataTable.Cell style={styles.exchangeColumn}>{stock.company.exchange}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn}>{formatStockPrice(stock.close, stock.currency)}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.change) }}>
                    {formatStockPercent(stock.change)}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numberColumn} textStyle={{ color: getStockPerformanceColor(stock.perfYear) }}>
                    {formatStockPercent(stock.perfYear)}
                  </DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={styles.recommendationColumn}
                    textStyle={recommendationColor ? { color: recommendationColor } : undefined}
                  >
                    {formatRecommendation(symbolResult)}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </View>
      ) : null}
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
  tableWidth: {
    minWidth: 940,
  },
  header: {
    zIndex: 1,
  },
  symbolColumn: {
    flex: 1.1,
  },
  companyColumn: {
    flex: 2.4,
  },
  exchangeColumn: {
    flex: 1.15,
  },
  numberColumn: {
    flex: 1.1,
  },
  recommendationColumn: {
    flex: 1.25,
  },
});