import type { FC } from "react";
import { StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";

type StockSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export const StockSearchBar: FC<StockSearchBarProps> = ({ value, onChangeText }) => {
  return (
    <Searchbar
      placeholder="Search stocks"
      value={value}
      onChangeText={onChangeText}
      style={styles.searchBar}
    />
  );
};

const styles = StyleSheet.create({
  searchBar: {
    width: 240,
  },
});
