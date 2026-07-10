import type { FC, ReactElement } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { Divider, List, Text, Tooltip } from "react-native-paper";

import {
  formatRecommendationPercent,
  getRecommendationColor,
  type StockListItem,
  type SymbolResult,
} from "@stocks";

import { StockExchangeChip } from "./StockExchangeChip";

type StockListProps = {
  stocks: readonly StockListItem[];
  symbolResultsBySymbol: ReadonlyMap<string, SymbolResult>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelectStock: (stock: StockListItem) => void;
  emptyState: ReactElement;
};

export const StockList: FC<StockListProps> = ({
  stocks,
  symbolResultsBySymbol,
  isRefreshing,
  onRefresh,
  onSelectStock,
  emptyState,
}) => {
  return (
    <FlatList
      data={stocks}
      ItemSeparatorComponent={Divider}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={emptyState}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <StockListRow
          stock={item}
          symbolResult={symbolResultsBySymbol.get(item.id)}
          onPress={() => onSelectStock(item)}
        />
      )}
      contentContainerStyle={stocks.length === 0 ? styles.emptyList : undefined}
    />
  );
};

type StockListRowProps = {
  stock: StockListItem;
  symbolResult: SymbolResult | undefined;
  onPress: () => void;
};

const StockListRow: FC<StockListRowProps> = ({ stock, symbolResult, onPress }) => {
  const recommendationColor = getRecommendationColor(symbolResult);

  return (
    <List.Item
      title={
        <Tooltip title={`TA Rating 1D: ${formatRecommendationPercent(symbolResult)}`}>
          <Text style={recommendationColor ? { color: recommendationColor } : undefined}>{stock.name}</Text>
        </Tooltip>
      }
      description={stock.description}
      descriptionNumberOfLines={2}
      left={(props) => <List.Icon {...props} icon="chart-line" />}
      right={() => (
        <StockExchangeChip exchange={stock.company.exchange} symbolResult={symbolResult} style={styles.exchangeChip} />
      )}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  emptyList: {
    flexGrow: 1,
  },
  exchangeChip: {
    marginRight: 16,
  },
});
