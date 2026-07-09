export type FilterOperator = "equal" | "in_range" | "has" | "has_none_of";

export type LogicalOperator = "and" | "or";

export type SortOrder = "asc" | "desc";

export type StocksQueryColumn =
  | "ticker-view"
  | "close"
  | "type"
  | "typespecs"
  | "pricescale"
  | "minmov"
  | "fractional"
  | "minmove2"
  | "currency"
  | "change"
  | "Perf.W"
  | "Perf.1M"
  | "Perf.3M"
  | "Perf.6M"
  | "Perf.YTD"
  | "Perf.Y"
  | "Perf.5Y"
  | "Perf.10Y"
  | "Perf.All"
  | "Volatility.W"
  | "Volatility.M";

export type FilterExpression = Readonly<{
  left: string;
  operation: FilterOperator;
  right: unknown;
}>;

export type FilterGroup = Readonly<{
  operator: LogicalOperator;
  operands: readonly FilterNode[];
}>;

export type FilterNode =
  | Readonly<{ expression: FilterExpression }>
  | Readonly<{ operation: FilterGroup }>;

export type StocksQuery = Readonly<{
  columns: readonly StocksQueryColumn[];
  sort: {
    sortBy: StocksQueryColumn;
    sortOrder: SortOrder;
  };
  filter: readonly FilterExpression[];
  filter2: FilterGroup;
  ignore_unknown_fields: boolean;
  options: Readonly<{ lang: string }>;
  price_conversion: Readonly<{ to_currency: string }>;
  range: readonly [number, number];
  markets: readonly string[];
}>;

export type Company = Readonly<{
  description: string;
  exchange: string;
  name: string;
  type: string;
  typespecs: readonly string[];
}>;

export type Details = readonly [
  company: Company,
  close: number,
  type: string,
  typespecs: readonly string[],
  pricescale: number,
  minmov: number,
  fractional: string,
  minmove2: number,
  currency: string,
  change: number,
  perfWeek: number,
  perfMonth: number,
  perf3Months: number,
  perf6Months: number,
  perfYtd: number,
  perfYear: number,
  perf5Years: number,
  perf10Years: number,
  perfAll: number,
  volatilityWeek: number,
  volatilityMonth: number,
];

export type Stock = Readonly<{
  s: string;
  d: Details;
}>;

export type StockListItem = Readonly<{
  id: string;
  name: string;
  description: string;
}>;

export type StocksQueryResult = Readonly<{
  data: readonly Stock[];
}>;

export function mapStockListItems(result: StocksQueryResult): StockListItem[] {
  return result.data.map((stock) => {
    const company = stock.d[0];

    return {
      id: stock.s,
      name: company.name || stock.s,
      description: company.description || `${company.exchange} ${company.type}`,
    };
  });
}
