import type { FC } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Chip, Tooltip } from "react-native-paper";

import { formatRecommendationPercent, getRecommendationColor, type SymbolResult } from "@stocks";

type StockExchangeChipProps = {
  exchange: string;
  symbolResult: SymbolResult | undefined;
  style?: StyleProp<ViewStyle>;
};

export const StockExchangeChip: FC<StockExchangeChipProps> = ({ exchange, symbolResult, style }) => {
  const recommendationColor = getRecommendationColor(symbolResult);

  return (
    <Tooltip title={`TA Rating (1D): ${formatRecommendationPercent(symbolResult)}`}>
      <Chip
        compact
        mode="outlined"
        style={[styles.chip, recommendationColor ? { borderColor: recommendationColor } : undefined, style]}
        textStyle={recommendationColor ? { color: recommendationColor } : undefined}
      >
        {exchange}
      </Chip>
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "center",
    backgroundColor: "transparent",
  },
});
