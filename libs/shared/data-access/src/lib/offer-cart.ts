import type { Signal } from '@angular/core';

/** The shop offer a customer picked for a product reference. */
export interface CartOffer {
  readonly offerId: string;
  readonly shopId: string;
  readonly shopName: string;
  readonly shopAddress: string | null;
  readonly shopLat: number | null;
  readonly shopLon: number | null;
  readonly price: number;
  readonly currency: 'USD' | 'CDF';
  readonly normalizedPriceCdf: number;
}

/** What a product page knows when it puts an offer in the cart. */
export interface CartSelection {
  readonly referenceId: string;
  readonly productId: string;
  readonly productName: string;
  readonly image: string | null;
  readonly offer: CartOffer;
}

/**
 * Cart contract shared by feature scopes. The cart scope implements it and
 * the app provides it explicitly, so products never import the cart library.
 */
export abstract class OfferCart {
  abstract readonly count: Signal<number>;
  /** Adds (or switches to) the given offer; guests are asked to log in first. */
  abstract choose(selection: CartSelection): void;
  abstract offerFor(referenceId: string): string | null;
  abstract quantityFor(referenceId: string): number;
  abstract changeQuantity(referenceId: string, delta: number): void;
}
