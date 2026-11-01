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
  CatalogPageCache,
  CatalogShopsStore,
  CategoryStore,
  LiveFavoritesStore,
  type CatalogPage,
  type CatalogQuery,
  type CatalogReference,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { Pagination, SelectCard } from '@talaprix/shared/ui-kit';
import { ClientLiveFilters, type PriceRange } from './client-live-filters';
import {
  ClientActiveFilters,
  type ActiveFilter,
} from './client-active-filters';
import { ClientLiveProductCard } from './client-live-product-card';

@Component({
  selector: 'tpx-client-live-results',
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
  readonly #api = inject(CatalogApi);
  readonly #cache = inject(CatalogPageCache);
  readonly #shops = inject(CatalogShopsStore);
  readonly shops = this.#shops.shops;
  readonly #categories = inject(CategoryStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly favorites = inject(LiveFavoritesStore);
  readonly ui = inject(PreviewPreferences);

  readonly items = signal<readonly CatalogReference[]>([]);
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
    void this.#categories.load();
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
      void this.load();
    });
  }

  async load(): Promise<void> {
    const request = ++this.#request;
    const query: CatalogQuery = {
      q: this.q(),
      page: this.page(),
      limit: 24,
      categoryId: this.categoryId() || undefined,
      shopIds: this.shopIds(),
      sort: this.sort(),
      currency: this.ui.currency(),
      minPrice: this.validPrice(this.minPrice()),
      maxPrice: this.validPrice(this.maxPrice()),
    };
    const key = this.#cache.key(query);
    const cached = this.#cache.get(key);
    // Back navigation paints the last known page at once, then refreshes it.
    if (cached) this.#show(cached.page);
    else this.status.set('loading');
    this.error.set('');
    if (cached && Date.now() - cached.at < 60_000) return;
    try {
      const result = await this.#api.list(query);
      if (request !== this.#request) return;
      this.#cache.set(key, result);
      this.#show(result);
    } catch (error) {
      if (request !== this.#request || cached) return;
      this.items.set([]);
      this.error.set(
        error instanceof Error ? error.message : 'Catalogue indisponible.',
      );
      this.status.set('error');
    }
  }

  #show(result: CatalogPage): void {
    this.items.set(result.items);
    this.total.set(result.total);
    this.totalPages.set(Math.max(1, result.totalPages));
    this.rate.set(result.usdToCdf);
    this.status.set('ready');
  }

  selectCategory(value: string): void {
    void this.navigate({ category_id: value || null, page: null });
  }
  selectSort(value: string): void {
    void this.navigate({ sort: value, page: null });
  }
  applyPrice(range: PriceRange): void {
    void this.navigate({
      min_price: this.validPrice(range.min)?.toString() ?? null,
      max_price: this.validPrice(range.max)?.toString() ?? null,
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
    const selected = this.ui.currency();
    const rate = this.rate();
    let value: number;
    if (selected === item.currency) value = item.price;
    else if (selected === 'CDF') value = item.normalizedPriceCdf;
    else if (rate && rate > 0) value = item.normalizedPriceCdf / rate;
    else return this.format(item.price, item.currency);
    return this.format(value, selected);
  }
  private format(value: number, currency: 'CDF' | 'USD'): string {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: currency === 'CDF' ? 0 : 2 }).format(value)} ${currency === 'CDF' ? 'FC' : 'USD'}`;
  }
  private validPrice(value: string): number | undefined {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  }
  private async navigate(params: Record<string, string | null>): Promise<void> {
    await this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}

