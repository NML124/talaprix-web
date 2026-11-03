import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { productImageSrcset, productImageUrl } from '@talaprix/shared/utils';
import {
  CatalogCartActions,
  LiveFavoritesStore,
} from '@talaprix/products/data-access';
import {
  AuthGate,
  PreviewPreferences,
  SupabaseFunctions,
} from '@talaprix/shared/data-access';

interface Favorite {
  readonly productId: string;
  readonly referenceId: string | null;
  readonly name: string;
  readonly image: string | null;
  readonly price: number | null;
  readonly currency: 'USD' | 'CDF';
  readonly normalizedPriceCdf: number | null;
}
@Component({
  selector: 'tpx-client-live-favorites',
  imports: [RouterLink],
  templateUrl: './client-live-favorites.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveFavorites {
  readonly imageUrl = productImageUrl;
  readonly imageSrcset = (source: string | null) =>
    productImageSrcset(source, [320, 640]);
  readonly #functions = inject(SupabaseFunctions);
  readonly gate = inject(AuthGate);
  readonly #favoriteStore = inject(LiveFavoritesStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;
  readonly ui = inject(PreviewPreferences);
  readonly #favorites = signal<readonly Favorite[]>([]);
  /** Hides a favorite as soon as it is removed; it comes back if the write fails. */
  readonly favorites = computed(() =>
    this.#favorites().filter((item) =>
      this.#favoriteStore.isFavorite(item.productId, true),
    ),
  );
  readonly favoriteError = this.#favoriteStore.error;
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal('');
  #request = 0;
  constructor() {
    effect(() => {
      if (this.gate.signedIn()) void this.load();
      else {
        ++this.#request;
        this.#favorites.set([]);
        this.status.set('idle');
      }
    });
  }
  async load(): Promise<void> {
    void this.ui.ensureLiveRate();
    const request = ++this.#request;
    this.status.set('loading');
    this.error.set('');
    try {
      const favorites = await this.#functions.get<unknown>(
        'get-favorite-products',
      );
      if (!Array.isArray(favorites))
        throw new Error('Réponse des favoris invalide.');
      if (request !== this.#request) return;
      this.#favorites.set(favorites.map(mapFavorite).filter(isNotNull));
      this.status.set('ready');
    } catch (error) {
      if (request !== this.#request) return;
      this.error.set(
        error instanceof Error ? error.message : 'Favoris indisponibles.',
      );
      this.status.set('error');
    }
  }
  remove(item: Favorite): void {
    this.#favoriteStore.toggle(item.productId, true);
  }
  price(item: Favorite): string {
    if (item.price === null) return 'Prix indisponible';
    if (item.normalizedPriceCdf !== null)
      return this.ui.liveMoney(
        item.price,
        item.currency,
        item.normalizedPriceCdf,
      );
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: item.currency === 'CDF' ? 0 : 2 }).format(item.price)} ${item.currency === 'CDF' ? 'FC' : 'USD'}`;
  }
}
function mapFavorite(value: unknown): Favorite | null {
  if (!isRecord(value)) return null;
  const productId = str(value['product_id']);
  const name = str(value['name']);
  if (!productId || !name) return null;
  return {
    productId,
    name,
    referenceId: str(value['offer_reference_id']),
    image: str(value['product_picture']),
    price: num(value['price']),
    currency: value['devise_name'] === 'USD' ? 'USD' : 'CDF',
    normalizedPriceCdf: num(value['normalized_price_cdf']),
  };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
