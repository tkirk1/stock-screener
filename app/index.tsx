import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Divider,
  List,
  Text,
  useTheme,
} from "react-native-paper";

import type { StockListItem } from "@stocks";
import { useStocksQuery } from "@stocks/query";

export default function StocksScreen() {
  const theme = useTheme();
  const { data = [], error, isFetching, isLoading, refetch } = useStocksQuery();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: "Stock Screener" }} />
      <StatusBar style="auto" />
      <Appbar.Header elevated>
        <Appbar.Content title="Stock Screener" subtitle={`${data.length} cached results`} />
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
          data={data}
          ItemSeparatorComponent={Divider}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyState />}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          renderItem={({ item }) => <StockRow stock={item} />}
          contentContainerStyle={data.length === 0 ? styles.emptyList : undefined}
        />
      )}
    </View>
  );
}

function StockRow({ stock }: { stock: StockListItem }) {
  return (
    <List.Item
      title={stock.name}
      description={stock.description}
      descriptionNumberOfLines={2}
      left={(props) => <List.Icon {...props} icon="chart-line" />}
    />
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
});
