import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Text, useTheme } from "react-native-paper";
import { StockListItem } from "@stocks/types"
import { StockResults, StockSearchBar, SymbolDetailsDialog } from "@stocks/components";
import { getErrorMessage, getRecommendationValue } from "@stocks/functions";
import { useStocksQuery, useSymbolsQuery } from "@stocks/query";

export default function StocksScreen() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const { data = [], error, isFetching, isLoading, refetch } = useStocksQuery();
  const symbolsQuery = useSymbolsQuery(data.length > 0);
  const [selectedStock, setSelectedStock] = useState<StockListItem | null>(null);
  const [searchFilterText, setSearchFilterText] = useState<string>("");
  const symbolResultsBySymbol = useMemo(
    () => new Map((symbolsQuery.data ?? []).map((symbolResult) => [symbolResult.symbol, symbolResult])),
    [symbolsQuery.data],
  );
  const sortedStocks = useMemo(
    () =>
      [...data].sort(
        (left, right) =>
          getRecommendationValue(symbolResultsBySymbol.get(right.id)) -
          getRecommendationValue(symbolResultsBySymbol.get(left.id)),
      ),
    [data, symbolResultsBySymbol],
  );
  const filteredStocks = useMemo(() => {
    const normalizedSearchQuery = searchFilterText.trim().toLocaleLowerCase();

    if (!normalizedSearchQuery) {
      return sortedStocks;
    }

    return sortedStocks.filter((stock) =>
      [stock.id, stock.name, stock.company.exchange, stock.company.description].some((value) =>
        value.toLocaleLowerCase().includes(normalizedSearchQuery),
      ),
    );
  }, [searchFilterText, sortedStocks]);
  const selectedSymbolResult = selectedStock ? symbolResultsBySymbol.get(selectedStock.id) : undefined;
  const useDataTable = Platform.OS === "web" && width > height;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: "Stock Screener" }} />
      <StatusBar style="auto" />
      <Appbar.Header elevated>
        <Appbar.Content title={`Stock Screener (${filteredStocks.length})`} />
        <StockSearchBar value={searchFilterText} onChangeText={setSearchFilterText} />
        <Appbar.Action disabled={isFetching} icon="refresh" onPress={() => refetch()} />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator />
          <Text style={styles.stateText}>Loading stocks...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text variant="titleMedium">Unable to load stocks</Text>
          <Text style={styles.stateText}>{getErrorMessage(error)}</Text>
          <Button mode="contained" onPress={() => refetch()}>
            Retry
          </Button>
        </View>
      ) : (
        <StockResults
          useDataTable={useDataTable}
          stocks={filteredStocks}
          symbolResultsBySymbol={symbolResultsBySymbol}
          isRefreshing={isFetching}
          onRefresh={refetch}
          onSelectStock={setSelectedStock}
          emptyState={<EmptyState />}
        />
      )}

      <SymbolDetailsDialog
        stock={selectedStock}
        symbolResult={selectedSymbolResult}
        onDismiss={() => setSelectedStock(null)}
      />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.centerContent}>
      <Text variant="titleMedium">No stocks found</Text>
      <Text style={styles.stateText}>Try refreshing the screener.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  stateText: {
    textAlign: "center",
  },
});
