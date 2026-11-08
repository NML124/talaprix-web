import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CatalogApi,
  CatalogSearchApi,
  CatalogCartActions,
  CatalogPageCache,
  CatalogShopsStore,
  CategoryStore,
  LiveFavoritesStore,
  type CatalogPage,
  type CatalogQuery,
  type CatalogReference,
  type CatalogSuggestion,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { catalogPrice, phoneCategoryIds } from './client-results-query';
import { productImageUrl } from '@talaprix/shared/utils';
import { Pagination, SelectCard } from '@talaprix/shared/ui-kit';
import { ClientLiveFilters, type PriceRange } from './client-live-filters';
import {
  ClientActiveFilters,
  type ActiveFilter,
} from './client-active-filters';
import { ClientLiveProductCard } from './client-live-product-card';
import { displayPrice } from './client-live-detail-format';
import { ClientResultsSeo } from './client-results-seo';
import { paginationUrl } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-client-live-results',
  providers: [ClientResultsSeo],
  imports: [
    RouterLink,
    SelectCard,
    Pagination,
    ClientLiveFilters,
    ClientActiveFilters,
    ClientLiveProductCard,
  ],
  templateUrl: './client-live-results.html',
  host: {
    class: 'block',
    '(document:keydown.escape)': 'filtersOpen.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveResults {
  readonly #seo = inject(ClientResultsSeo);
  readonly pageHref = (page: number) => paginationUrl(this.#router.url, page);
  readonly imageUrl = productImageUrl;
  readonly #api = inject(CatalogApi);
  readonly #searchApi = inject(CatalogSearchApi);
  readonly #cache = inject(CatalogPageCache);
  readonly #shops = inject(CatalogShopsStore);
  readonly shops = this.#shops.shops;
  readonly #categories = inject(CategoryStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;
  readonly ui = inject(PreviewPreferences);

  readonly items = signal<readonly CatalogReference[]>([]);
  readonly suggestions = signal<readonly CatalogSuggestion[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly rate = signal<number | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly error = signal('');
  readonly q = signal('');
  readonly categoryId = signal('');
  readonly shopIds = signal<readonly string[]>([]);
  readonly sort = signal('name_asc');
  readonly minPrice = signal('');
  readonly maxPrice = signal('');
  readonly filtersOpen = signal(false);
  readonly categories = this.#categories.categories;
  readonly displayCategories = this.#categories.displayCategories;
  readonly skeletons = Array.from({ length: 10 }, (_, index) => index);
  readonly currencyLabel = computed(() =>
    this.ui.currency() === 'CDF' ? 'FC' : 'USD',
  );
  readonly activeFilters = computed<readonly ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (this.q()) filters.push({ key: 'q', label: `« ${this.q()} »` });
    if (this.categoryId())
      filters.push({
        key: 'category',
        label:
          this.categories().find((c) => c.id === this.categoryId())?.name ??
          'Catégorie',
      });
    const shopNames = new Map(this.shops().map((shop) => [shop.id, shop.name]));
    for (const id of this.shopIds())
      filters.push({
        key: `shop:${id}`,
        label: shopNames.get(id) ?? 'Boutique',
      });
    const min = this.minPrice();
    const max = this.maxPrice();
    const unit = this.currencyLabel();
    if (min || max)
      filters.push({
        key: 'price',
        label:
          min && max
            ? `${min} à ${max} ${unit}`
            : min
              ? `Dès ${min} ${unit}`
              : `Jusqu'à ${max} ${unit}`,
      });
    return filters;
  });
  readonly sortOptions = [
    { value: 'name_asc', label: 'Nom' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
  ];
  #request = 0;

  constructor() {
    void this.#shops.load();
    this.#route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.q.set(params.get('q')?.trim() ?? '');
      this.categoryId.set(params.get('category_id') ?? '');
      this.shopIds.set(
        (params.get('shop_ids') ?? '').split(',').filter(Boolean),
      );
      this.sort.set(params.get('sort') ?? 'name_asc');
      const page = Number(params.get('page') ?? '1');
      this.page.set(Number.isInteger(page) && page > 0 ? page : 1);
      this.minPrice.set(params.get('min_price') ?? '');
      this.maxPrice.set(params.get('max_price') ?? '');
      void this.#categories.load().then(() => this.load());
    });
  }

  async load(): Promise<void> {
    const request = ++this.#request;
    this.suggestions.set([]);
    const query: CatalogQuery = {
      q: this.q(),
      page: this.page(),
      limit: 24,
      categoryId: this.categoryId() || undefined,
      categoryIds: phoneCategoryIds(this.categories(), this.categoryId()),
      shopIds: this.shopIds(),
      sort: this.sort(),
      currency: this.ui.currency(),
      minPrice: catalogPrice(this.minPrice()),
      maxPrice: catalogPrice(this.maxPrice()),
    };
    const key = this.#cache.key(query);
    const cached = this.#cache.get(key);
    // Back navigation paints the last known page at once, then refreshes it.
    if (cached) {
      this.#show(cached.page);
      if (!cached.page.items.length && query.q && query.page === 1)
        void this.#loadSuggestions(query.q, request);
    } else this.status.set('loading');
    this.error.set('');
    if (cached && Date.now() - cached.at < 60_000) return;
    try {
      const result = await this.#api.list(query);
      if (request !== this.#request) return;
      this.#cache.set(key, result);
      this.#show(result);
      if (!result.items.length && query.q && query.page === 1)
        void this.#loadSuggestions(query.q, request);
    } catch (error) {
      if (request !== this.#request || cached) return;
      this.items.set([]);
      this.error.set(
        error instanceof Error ? error.message : 'Catalogue indisponible.',
      );
      this.status.set('error');
      this.#seo.unavailable(this.#router.url);
    }
  }

  async #loadSuggestions(q: string, request: number): Promise<void> {
    const words = q.trim().split(/\s+/);
    // A later misspelt word must not erase useful suggestions shown while typing.
    for (
      let length = words.length;
      length > 0 && length >= words.length - 2;
      length--
    ) {
      try {
        const suggestions = await this.#searchApi.suggest(
          words.slice(0, length).join(' '),
          8,
        );
        if (request !== this.#request) return;
        if (suggestions.length) {
          this.suggestions.set(suggestions);
          return;
        }
      } catch {
        // The main catalogue remains usable when the suggestion index is down.
        return;
      }
    }
  }

  #show(result: CatalogPage): void {
    this.items.set(result.items);
    this.total.set(result.total);
    this.totalPages.set(Math.max(1, result.totalPages));
    this.rate.set(result.usdToCdf);
    this.status.set('ready');
    this.#seo.update(result, this.#router.url, this.categories());
  }

  selectCategory(value: string): void {
    void this.navigate({ category_id: value || null, page: null });
  }
  selectSort(value: string): void {
    void this.navigate({ sort: value, page: null });
  }
  applyPrice(range: PriceRange): void {
    void this.navigate({
      min_price: catalogPrice(range.min)?.toString() ?? null,
      max_price: catalogPrice(range.max)?.toString() ?? null,
      page: null,
    });
  }
  removeFilter(key: string): void {
    const params: Record<string, Record<string, null>> = {
      q: { q: null },
      category: { category_id: null },
      price: { min_price: null, max_price: null },
    };
    if (key.startsWith('shop:')) {
      this.toggleShop(key.slice(5));
      return;
    }
    void this.navigate({ ...params[key], page: null });
  }
  clearFilters(): void {
    void this.navigate({
      q: null,
      category_id: null,
      shop_ids: null,
      min_price: null,
      max_price: null,
      page: null,
    });
  }
  toggleShop(id: string): void {
    const ids = this.shopIds().includes(id)
      ? this.shopIds().filter((value) => value !== id)
      : [...this.shopIds(), id];
    void this.navigate({ shop_ids: ids.join(',') || null, page: null });
  }
  goToPage(value: number): void {
    if (value < 1 || value > this.totalPages()) return;
    void this.navigate({ page: value === 1 ? null : String(value) });
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  favorite(item: CatalogReference): boolean {
    return this.favorites.isFavorite(item.productId, item.isFavorite);
  }
  toggleFavorite(item: CatalogReference): void {
    this.favorites.toggle(item.productId, item.isFavorite);
  }
  price(item: CatalogReference): string {
    return displayPrice(item, this.ui.currency(), this.rate());
  }
  private async navigate(params: Record<string, string | null>): Promise<void> {
    await this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
