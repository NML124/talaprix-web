import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CategoryStore,
  CatalogApi,
  LiveFavoritesStore,
  type CatalogReference,
} from '@talaprix/products/data-access';
import { HomeCatalogStore } from '@talaprix/home/data-access';
import { AuthGate, OfferCart } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-live-home',
  imports: [RouterLink],
  templateUrl: './client-live-home.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveHome {
  readonly #store = inject(HomeCatalogStore);
  readonly #categories = inject(CategoryStore);
  readonly #catalog = inject(CatalogApi);
  readonly #gate = inject(AuthGate);
  readonly cart = inject(OfferCart);
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartPending = signal<string | null>(null);
  readonly cartError = signal('');
  readonly products = this.#store.products;
  readonly shops = this.#store.shops;
  readonly categories = this.#categories.categories;
  readonly status = computed(() =>
    this.#store.status() === 'idle' ? 'loading' : this.#store.status(),
  );
  readonly error = this.#store.error;

  constructor() {
    void this.#categories.load();
    void this.#store.load();
  }

  load(): void {
    void this.#store.load(true);
  }

  addToCart(item: CatalogReference): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () => {
        void this.chooseBestOffer(item);
      },
    );
  }

  private async chooseBestOffer(item: CatalogReference): Promise<void> {
    if (this.cartPending()) return;
    this.cartPending.set(item.id);
    this.cartError.set('');
    try {
      const detail = await this.#catalog.detail(item.id);
      const offer =
        detail.offers.find((value) => value.id === detail.bestOfferId) ??
        detail.offers.reduce<(typeof detail.offers)[number] | null>(
          (best, value) =>
            !best || value.normalizedPriceCdf < best.normalizedPriceCdf
              ? value
              : best,
          null,
        );
      if (!offer) throw new Error('Aucune offre disponible pour ce produit.');
      this.cart.choose({
        referenceId: item.id,
        productId: item.productId,
        productName: item.name,
        image: item.image ?? offer.image,
        offer: {
          offerId: offer.id,
          shopId: offer.shopId,
          shopName: offer.shopName,
          shopAddress: offer.shopAddress,
          shopLat: offer.shopLat,
          shopLon: offer.shopLon,
          price: offer.price,
          currency: offer.currency,
          normalizedPriceCdf: offer.normalizedPriceCdf,
        },
      });
    } catch (error) {
      this.cartError.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’ajouter au panier.',
      );
    } finally {
      this.cartPending.set(null);
    }
  }

  price(item: CatalogReference): string {
    return `${new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: item.currency === 'CDF' ? 0 : 2,
    }).format(item.price)} ${item.currency === 'CDF' ? 'FC' : 'USD'}`;
  }
}
