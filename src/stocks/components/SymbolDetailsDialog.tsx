import type { FC } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

import { formatSymbolValue, getSymbolFields } from "@stocks/functions";
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

  return (
    <Portal>
      <Dialog
        visible={stock !== null}
        onDismiss={onDismiss}
        style={[styles.dialog, isLandscape && { width: "50%", alignSelf: "center" }]}
      >
        <Dialog.Title>{stock?.id ?? "Symbol details"}</Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView contentContainerStyle={styles.dialogContent} style={styles.dialogScrollView}>
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
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow: FC<DetailRowProps> = ({ label, value }) => {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={styles.detailLabel}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  stateText: {
    textAlign: "center",
  },
});
