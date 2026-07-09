import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Dialog,
  Divider,
  List,
  Portal,
  Text,
  Tooltip,
  useTheme,
} from "react-native-paper";

import type { StockListItem, SymbolResult } from "@stocks";
import { useStocksQuery, useSymbolsQuery } from "@stocks/query";

export default function StocksScreen() {
  const theme = useTheme();
  const { data = [], error, isFetching, isLoading, refetch } = useStocksQuery();
  const symbolsQuery = useSymbolsQuery(data.length > 0);
  const [selectedStock, setSelectedStock] = useState<StockListItem | null>(null);
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
  const selectedSymbolResult = selectedStock ? symbolResultsBySymbol.get(selectedStock.id) : undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: "Stock Screener" }} />
      <StatusBar style="auto" />
      <Appbar.Header elevated>
        <Appbar.Content title="Stock Screener" subtitle={`${sortedStocks.length} cached results`} />
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
        <FlatList
          data={sortedStocks}
          ItemSeparatorComponent={Divider}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState />}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <StockRow
              stock={item}
              symbolResult={symbolResultsBySymbol.get(item.id)}
              onPress={() => setSelectedStock(item)}
            />
          )}
          contentContainerStyle={sortedStocks.length === 0 ? styles.emptyList : undefined}
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

function StockRow({
  stock,
  symbolResult,
  onPress,
}: {
  stock: StockListItem;
  symbolResult: SymbolResult | undefined;
  onPress: () => void;
}) {
  return (
    <List.Item
      title={
        <Tooltip title={`Recommend.All: ${formatRecommendation(symbolResult)}`}>
          <Text>{stock.name}</Text>
        </Tooltip>
      }
      description={stock.description}
      descriptionNumberOfLines={2}
      left={(props) => <List.Icon {...props} icon="chart-line" />}
      onPress={onPress}
    />
  );
}

function SymbolDetailsDialog({
  stock,
  symbolResult,
  onDismiss,
}: {
  stock: StockListItem | null;
  symbolResult: SymbolResult | undefined;
  onDismiss: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const fields = getSymbolFields(symbolResult);
  const isLandscape = width > height;

  return (
    <Portal>
      <Dialog
        visible={stock !== null}
        onDismiss={onDismiss}
        style={[styles.dialog, isLandscape && { width: "50%", alignSelf: "center" }]}
      >
        <Dialog.Title>{stock?.name ?? "Symbol details"}</Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView
            contentContainerStyle={styles.dialogContent}
            style={styles.dialogScrollView}
          >
            <Text variant="labelLarge">{stock?.id}</Text>
            {symbolResult ? (
              <>
                <DetailRow label="Status" value={`${symbolResult.statusCode}`} />
                {fields.length > 0 ? (
                  fields.map(([label, value]) => (
                    <DetailRow key={label} label={label} value={formatSymbolValue(value)} />
                  ))
                ) : (
                  <Text style={styles.stateText}>No symbol data available.</Text>
                )}
              </>
            ) : (
              <Text style={styles.stateText}>Loading symbol data...</Text>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={styles.detailLabel}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{value}</Text>
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error occurred.";
}

function formatRecommendation(symbolResult: SymbolResult | undefined) {
  const recommendation = symbolResult?.data?.["Recommend.All"];

  return typeof recommendation === "number" ? recommendation.toFixed(2) : "Loading";
}

function getRecommendationValue(symbolResult: SymbolResult | undefined) {
  const recommendation = symbolResult?.data?.["Recommend.All"];

  return typeof recommendation === "number" ? recommendation : Number.NEGATIVE_INFINITY;
}

function getSymbolFields(symbolResult: SymbolResult | undefined) {
  return Object.entries(symbolResult?.data ?? {}).sort(([left], [right]) => left.localeCompare(right));
}

function formatSymbolValue(value: unknown) {
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
  emptyList: {
    flexGrow: 1,
  },
  stateText: {
    textAlign: "center",
  },
  dialog: {
    height: "80%",
  },
  dialogScrollArea: {
    flex: 1,
  },
  dialogScrollView: {
    flex: 1,
  },
  dialogActions: {
    flexGrow: 0,
  },
  dialogContent: {
    gap: 12,
    paddingVertical: 12,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontVariant: ["tabular-nums"],
  },
});
