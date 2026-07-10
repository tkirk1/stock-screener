import type { FC, ReactElement } from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { Chip, Divider, List, Text, Tooltip } from "react-native-paper";

import {
  formatRecommendation,
  getRecommendationColor,
  type StockListItem,
  type SymbolResult,
} from "@stocks";

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
        <Tooltip title={`Recommend.All: ${formatRecommendation(symbolResult)}`}>
          <Text style={recommendationColor ? { color: recommendationColor } : undefined}>{stock.name}</Text>
        </Tooltip>
      }
      description={stock.description}
      descriptionNumberOfLines={2}
      left={(props) => <List.Icon {...props} icon="chart-line" />}
      right={() => (
        <Chip compact style={styles.exchangeChip}>
          {stock.company.exchange}
        </Chip>
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
    alignSelf: "center",
    marginRight: 16,
  },
});
