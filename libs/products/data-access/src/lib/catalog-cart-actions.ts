import { inject, Service, signal } from '@angular/core';
import { AuthGate, OfferCart } from '@talaprix/shared/data-access';
import {
  CatalogApi,
  type CatalogReference,
  type CatalogReferenceDetail,
} from './catalog-api';

/** Resolves the current best offer before selecting a product from a catalog card. */
@Service()
export class CatalogCartActions {
  readonly #api = inject(CatalogApi);
  readonly #gate = inject(AuthGate);
  readonly cart = inject(OfferCart);
  readonly pending = signal<string | null>(null);
  readonly error = signal('');

  add(item: CatalogReference): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () => {
        void this.#choose(item);
      },
    );
  }

  addByReferenceId(referenceId: string): void {
    this.#gate.require(
      'Connectez-vous pour ajouter ce produit au panier.',
      () => {
        void this.#chooseById(referenceId);
      },
    );
  }

  async #chooseById(referenceId: string): Promise<void> {
    if (this.pending() || this.cart.quantityFor(referenceId)) return;
    this.pending.set(referenceId);
    this.error.set('');
    try {
      const detail = await this.#api.detail(referenceId);
      this.pending.set(null);
      await this.#choose(detail.reference, detail);
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’ajouter au panier.',
      );
      this.pending.set(null);
    }
  }

  change(referenceId: string, delta: number): void {
    this.cart.changeQuantity(referenceId, delta);
  }

  async #choose(
    item: CatalogReference,
    loaded?: CatalogReferenceDetail,
  ): Promise<void> {
    if (this.pending() || this.cart.quantityFor(item.id)) return;
    this.pending.set(item.id);
    this.error.set('');
    try {
      const detail = loaded ?? (await this.#api.detail(item.id));
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
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’ajouter au panier.',
      );
    } finally {
      this.pending.set(null);
    }
  }
}
