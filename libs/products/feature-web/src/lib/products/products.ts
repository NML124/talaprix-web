import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoritesStore, ProductStore } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import { CatalogFilters } from './catalog-filters/catalog-filters';
import {
  EMPTY_CATALOG_FILTERS,
  type CatalogFilterSelection,
} from './catalog-filters/catalog-filter-models';
import { CatalogGrid } from './catalog-grid/catalog-grid';
import { CatalogHero } from './catalog-hero/catalog-hero';
import {
  CatalogToolbar,
  type CatalogActiveFilter,
  type CatalogSort,
  type CatalogViewMode,
} from './catalog-toolbar/catalog-toolbar';

@Component({
  selector: 'tpx-products',
  imports: [CatalogFilters, CatalogGrid, CatalogHero, CatalogToolbar],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  readonly #store = inject(ProductStore);
  readonly #favorites = inject(FavoritesStore);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  protected readonly query = signal('');
  protected readonly sort = signal<CatalogSort>('relevance');
  protected readonly viewMode = signal<CatalogViewMode>('grid');
  protected readonly draftFilters = signal<CatalogFilterSelection>(
    EMPTY_CATALOG_FILTERS,
  );
  protected readonly appliedFilters = signal<CatalogFilterSelection>(
    EMPTY_CATALOG_FILTERS,
  );
  protected readonly status = this.#store.status;
  protected readonly favoriteIds = this.#favorites.ids;
  protected readonly categories = computed(() => [
    ...new Set(
      this.#store
        .items()
        .map((item) => item.categoryName)
        .filter((value): value is string => Boolean(value)),
    ),
  ]);
  protected readonly products = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('fr');
    const filters = this.appliedFilters();
    const filtered = this.#store.items().filter((item) => {
      const search =
        `${item.name} ${item.brandName ?? ''} ${item.categoryName ?? ''}`.toLocaleLowerCase(
          'fr',
        );
      const price = item.lowestPrice?.amount ?? 0;
      const shops = item.offers.map((offer) => offer.shopName);
      const locations = item.offers
        .map((offer) => offer.shopAddress)
        .filter((value): value is string => Boolean(value));
      return (
        (!query || search.includes(query)) &&
        (!filters.categories.length ||
          (item.categoryName !== undefined &&
            filters.categories.includes(item.categoryName))) &&
        (!filters.shops.length ||
          shops.some((shop) => filters.shops.includes(shop))) &&
        (!filters.locations.length ||
          locations.some((location) => filters.locations.includes(location))) &&
        (!filters.minPrice || price >= filters.minPrice) &&
        (!filters.maxPrice || price <= filters.maxPrice) &&
        (!filters.promotionOnly || item.oldPrice !== null) &&
        (!filters.availableOnly || item.offers.some((offer) => offer.inStock))
      );
    });
    return this.sort() === 'price'
      ? [...filtered].sort(
          (a, b) => (a.lowestPrice?.amount ?? 0) - (b.lowestPrice?.amount ?? 0),
        )
      : filtered;
  });
  protected readonly activeFilters = computed<CatalogActiveFilter[]>(() =>
    this.toActiveFilters(this.appliedFilters()),
  );
  readonly loadAfterRender = afterNextRender(() => {
    const category = this.#route.snapshot.queryParamMap.get('category');
    this.query.set(this.#route.snapshot.queryParamMap.get('query') ?? '');
    if (category) {
      const selection = { ...EMPTY_CATALOG_FILTERS, categories: [category] };
      this.draftFilters.set(selection);
      this.appliedFilters.set(selection);
    }
    void this.#store.load();
  });
  protected updateQuery(query: string): void {
    this.query.set(query);
  }
  protected updateDraft(filters: CatalogFilterSelection): void {
    this.draftFilters.set(filters);
  }
  protected applyFilters(filters: CatalogFilterSelection): void {
    this.draftFilters.set(filters);
    this.appliedFilters.set(filters);
  }
  protected updateSort(sort: CatalogSort): void {
    this.sort.set(sort);
  }
  protected updateViewMode(viewMode: CatalogViewMode): void {
    this.viewMode.set(viewMode);
  }
  protected removeFilter(key: string): void {
    const next = this.remove(this.appliedFilters(), key);
    this.appliedFilters.set(next);
    this.draftFilters.set(next);
  }
  protected clearFilters(): void {
    this.appliedFilters.set(EMPTY_CATALOG_FILTERS);
    this.draftFilters.set(EMPTY_CATALOG_FILTERS);
  }
  protected openProduct(product: ProductSummary): void {
    void this.#router.navigate(['/products', product.id]);
  }
  protected toggleFavorite(product: ProductSummary): void {
    this.#favorites.toggle(product.id);
  }
  private remove(
    filters: CatalogFilterSelection,
    key: string,
  ): CatalogFilterSelection {
    if (key.startsWith('category:'))
      return {
        ...filters,
        categories: filters.categories.filter(
          (item) => `category:${item}` !== key,
        ),
      };
    if (key.startsWith('shop:'))
      return {
        ...filters,
        shops: filters.shops.filter((item) => `shop:${item}` !== key),
      };
    if (key.startsWith('location:'))
      return {
        ...filters,
        locations: filters.locations.filter(
          (item) => `location:${item}` !== key,
        ),
      };
    if (key === 'min') return { ...filters, minPrice: null };
    if (key === 'max') return { ...filters, maxPrice: null };
    if (key === 'promotion') return { ...filters, promotionOnly: false };
    return { ...filters, availableOnly: false };
  }
  private toActiveFilters(
    filters: CatalogFilterSelection,
  ): CatalogActiveFilter[] {
    return [
      ...filters.categories.map((label) => ({
        key: `category:${label}`,
        label,
      })),
      ...filters.shops.map((label) => ({ key: `shop:${label}`, label })),
      ...filters.locations.map((label) => ({
        key: `location:${label}`,
        label,
      })),
      ...(filters.minPrice
        ? [
            {
              key: 'min',
              label: `Dès ${filters.minPrice.toLocaleString('fr-FR')} CDF`,
            },
          ]
        : []),
      ...(filters.maxPrice
        ? [
            {
              key: 'max',
              label: `Jusqu’à ${filters.maxPrice.toLocaleString('fr-FR')} CDF`,
            },
          ]
        : []),
      ...(filters.promotionOnly
        ? [{ key: 'promotion', label: 'Promotions' }]
        : []),
      ...(filters.availableOnly
        ? [{ key: 'availability', label: 'En stock' }]
        : []),
    ];
  }
}
