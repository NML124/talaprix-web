import { computed, inject, Service, signal } from '@angular/core';
import {
  CatalogApi,
  ProductInsightsApi,
  type CatalogOffer,
  type CatalogOfferSort,
  type CatalogReference,
  type CatalogReferenceDetail,
  type OfferInsight,
  type ProductInsights,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { displayPrice } from './client-live-detail-format';

/**
 * State of one live product page: the produit, its offres, best-effort
 * enrichment and similar produits. Provided by the page component.
 */
@Service({ autoProvided: false })
export class ClientLiveDetailStore {
  readonly #api = inject(CatalogApi);
  readonly #insightsApi = inject(ProductInsightsApi);
  readonly #ui = inject(PreviewPreferences);

  readonly detail = signal<CatalogReferenceDetail | null>(null);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  readonly error = signal('');
  readonly sort = signal<CatalogOfferSort>('best_price');
  readonly sorting = signal(false);
  readonly geoMessage = signal('');
  readonly insights = signal<ProductInsights | null>(null);
  readonly similar = signal<readonly CatalogReference[]>([]);
  readonly #similarRate = signal<number | null>(null);

  readonly reference = computed(() => this.detail()?.reference ?? null);
  readonly rate = computed(
    () => this.detail()?.usdToCdf ?? this.#similarRate(),
  );
  readonly bestOffer = computed<CatalogOffer | null>(() => {
    const detail = this.detail();
    if (!detail) return null;
    return (
      detail.offers.find((offer) => offer.id === detail.bestOfferId) ??
      cheapest(detail.offers)
    );
  });
  /** Prix: best offre first. Proximité: server distance order is kept. */
  readonly offers = computed<readonly CatalogOffer[]>(() => {
    const offers = this.detail()?.offers ?? [];
    const best = this.bestOffer();
    if (this.detail()?.sort === 'nearest' || !best) return offers;
    return [best, ...offers.filter((offer) => offer.id !== best.id)];
  });
  readonly shopsCount = computed(
    () => new Set(this.offers().map((offer) => offer.shopId)).size,
  );
  readonly priceRange = computed(() => {
    const offers = this.offers();
    if (!offers.length) return null;
    const sorted = [...offers].sort(
      (a, b) => a.normalizedPriceCdf - b.normalizedPriceCdf,
    );
    const low = this.price(sorted[0]);
    const high = this.price(sorted[sorted.length - 1]);
    return low === high ? { low, high: null } : { low, high };
  });
  readonly images = computed<readonly string[]>(() => {
    const reference = this.reference();
    const all = [
      reference?.image,
      ...(this.insights()?.images ?? []),
      ...this.offers().flatMap((offer) => [offer.image, ...offer.images]),
    ];
    return [...new Set(all.filter((url): url is string => !!url))].slice(0, 8);
  });

  #id = '';
  #request = 0;
  #controller: AbortController | null = null;

  load(id: string): void {
    if (id !== this.#id) {
      this.#id = id;
      this.sort.set('best_price');
      this.geoMessage.set('');
      this.insights.set(null);
      this.similar.set([]);
      this.detail.set(null);
    }
    void this.#fetch({ sort: this.sort() }, true);
  }

  retry(): void {
    if (this.#id) this.load(this.#id);
  }

  async sortBy(sort: CatalogOfferSort): Promise<void> {
    if (sort === this.sort() || this.sorting()) return;
    this.geoMessage.set('');
    if (sort === 'best_price') {
      this.sort.set(sort);
      await this.#fetch({ sort });
      return;
    }
    this.sorting.set(true);
    const position = await locate();
    this.sorting.set(false);
    if (!position) {
      this.geoMessage.set(
        'Localisation indisponible ou refusée. Les offres restent triées par prix.',
      );
      return;
    }
    this.sort.set('nearest');
    await this.#fetch({ sort, ...position });
  }

  price(item: CatalogOffer | CatalogReference): string {
    return displayPrice(item, this.#ui.currency(), this.rate());
  }

  insight(offerId: string): OfferInsight | null {
    return this.insights()?.offers[offerId] ?? null;
  }

  async #fetch(
    query: { sort: CatalogOfferSort; lat?: number; lon?: number },
    full = false,
  ): Promise<void> {
    const request = ++this.#request;
    this.#controller?.abort();
    const controller = new AbortController();
    this.#controller = controller;
    if (full || !this.detail()) this.status.set('loading');
    else this.sorting.set(true);
    this.error.set('');
    try {
      const detail = await this.#api.detail(
        this.#id,
        query,
        controller.signal,
      );
      if (request !== this.#request) return;
      const previous = this.detail()?.reference.productId;
      this.detail.set(detail);
      this.status.set('ready');
      if (previous !== detail.reference.productId) this.#enrich(detail);
    } catch (error) {
      if (request !== this.#request) return;
      if (this.detail()) {
        // A failed re-sort keeps the offres already on screen.
        this.sort.set(this.detail()?.sort ?? 'best_price');
        this.geoMessage.set('Le tri n’a pas pu être appliqué. Réessayez.');
      } else {
        this.error.set(
          error instanceof Error ? error.message : 'Produit indisponible.',
        );
        this.status.set('error');
      }
    } finally {
      if (request === this.#request) this.sorting.set(false);
    }
  }

  #enrich(detail: CatalogReferenceDetail): void {
    const id = this.#id;
    const { productId, categoryId } = detail.reference;
    this.#insightsApi
      .insights(productId)
      .then((insights) => {
        if (id === this.#id) this.insights.set(insights);
      })
      .catch(() => undefined);
    if (!categoryId) return;
    this.#api
      .list({ categoryId, limit: 12 })
      .then((page) => {
        if (id !== this.#id) return;
        this.#similarRate.set(page.usdToCdf);
        this.similar.set(page.items.filter((item) => item.id !== id));
      })
      .catch(() => undefined);
  }
}

function cheapest(offers: readonly CatalogOffer[]): CatalogOffer | null {
  return offers.reduce<CatalogOffer | null>(
    (best, offer) =>
      !best || offer.normalizedPriceCdf < best.normalizedPriceCdf
        ? offer
        : best,
    null,
  );
}

function locate(): Promise<{ lat: number; lon: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation)
    return Promise.resolve(null);
  return new Promise((resolve) =>
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    ),
  );
}
