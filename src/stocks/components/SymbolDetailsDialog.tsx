import type { FC } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

import { formatSymbolValue, getRecommendationColor, getSymbolFields } from "@stocks/functions";
import { StockListItem, SymbolResult } from "@stocks/types";

type SymbolDetailsDialogProps = {
  stock: StockListItem | null;
  symbolResult: SymbolResult | undefined;
  onDismiss: () => void;
};

export const SymbolDetailsDialog: FC<SymbolDetailsDialogProps> = ({ stock, symbolResult, onDismiss }) => {
  const { width, height } = useWindowDimensions();
  const fields = getSymbolFields(symbolResult);
  const isLandscape = width > height;
  const recommendationColor = getRecommendationColor(symbolResult);

  return (
    <Portal>
      <Dialog
        visible={stock !== null}
        onDismiss={onDismiss}
        style={[styles.dialog, isLandscape && { width: "50%", alignSelf: "center" }]}
      >
        <Dialog.Title style={recommendationColor ? { color: recommendationColor } : undefined}>
          {stock?.id ?? "Symbol details"}
        </Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView contentContainerStyle={styles.dialogContent} style={styles.dialogScrollView}>
            {symbolResult ? (
              <>
                <View style={styles.detailsGrid}>
                  <DetailRow
                    label="Status"
                    value={`${symbolResult.statusCode}`}
                    color={recommendationColor}
                  />
                  {fields.map(([label, value]) => (
                    <DetailRow
                      key={label}
                      label={label}
                      value={formatSymbolValue(value)}
                      color={recommendationColor}
                    />
                  ))}
                </View>
                {fields.length === 0 ? (
                  <Text style={styles.stateText}>No symbol data available.</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.stateText}>Loading symbol data...</Text>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions style={styles.dialogActions}>
          <Button onPress={onDismiss} textColor={recommendationColor}>
            Close
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
  color: string | undefined;
};

const DetailRow: FC<DetailRowProps> = ({ label, value, color }) => {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={[styles.detailLabel, color ? { color } : undefined]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    gap: 16,
    paddingVertical: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailRow: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 160,
    gap: 4,
  },
  detailLabel: {
    opacity: 0.7,
  },
  detailValue: {
    fontVariant: ["tabular-nums"],
  },
  stateText: {
    textAlign: "center",
  },
});
