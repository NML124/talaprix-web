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
  readonly pending = signal<ReadonlySet<string>>(new Set());

  isPending(referenceId: string | null): boolean {
    return referenceId !== null && this.pending().has(referenceId);
  }

  private setPending(referenceId: string, value: boolean): void {
    this.pending.update((current) => {
      const next = new Set(current);
      if (value) next.add(referenceId);
      else next.delete(referenceId);
      return next;
    });
  }
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
    if (this.isPending(referenceId) || this.cart.offerFor(referenceId)) return;
    this.cart.stage({
      referenceId,
      productId: null,
      productName: 'Produit à confirmer',
      image: null,
    });
    const owner = this.#gate.userId();
    this.setPending(referenceId, true);
    this.error.set('');
    try {
      const detail = await this.#api.detail(referenceId);
      this.setPending(referenceId, false);
      if (this.#gate.userId() !== owner || !this.cart.quantityFor(referenceId))
        return;
      await this.#choose(detail.reference, detail);
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Impossible d’ajouter au panier.',
      );
      this.setPending(referenceId, false);
    }
  }

  change(referenceId: string, delta: number): void {
    this.cart.changeQuantity(referenceId, delta);
  }

  async #choose(
    item: CatalogReference,
    loaded?: CatalogReferenceDetail,
  ): Promise<void> {
    if (this.isPending(item.id) || this.cart.offerFor(item.id)) return;
    this.cart.stage({
      referenceId: item.id,
      productId: item.productId,
      productName: item.name,
      image: item.image,
    });
    const owner = this.#gate.userId();
    this.setPending(item.id, true);
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
      if (this.#gate.userId() !== owner || !this.cart.quantityFor(item.id))
        return;
      if (this.cart.offerFor(item.id)) return;
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
      this.setPending(item.id, false);
    }
  }
}
