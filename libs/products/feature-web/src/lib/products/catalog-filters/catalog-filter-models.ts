export interface CatalogFilterSelection {
  readonly categories: readonly string[];
  readonly shops: readonly string[];
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly locations: readonly string[];
  readonly promotionOnly: boolean;
  readonly availableOnly: boolean;
}

export const EMPTY_CATALOG_FILTERS: CatalogFilterSelection = {
  categories: [],
  shops: [],
  minPrice: null,
  maxPrice: null,
  locations: [],
  promotionOnly: false,
  availableOnly: false,
};
