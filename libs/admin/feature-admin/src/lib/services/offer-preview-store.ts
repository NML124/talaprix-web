import { Service } from '@angular/core';
import { offers } from '../mocks/offers';
import type { Offer } from '../mocks/models';

@Service()
export class OfferPreviewStore {
  private readonly rows = structuredClone(offers);

  list(): Offer[] {
    return structuredClone(this.rows);
  }
  hasProduct(productId: number): boolean {
    return this.rows.some((row) => row.productId === productId);
  }
  hasShop(shop: string): boolean {
    return this.rows.some((row) => row.shop === shop);
  }
  save(value: Offer): void {
    const index = this.rows.findIndex((row) => row.id === value.id);
    if (index < 0) this.rows.unshift(structuredClone(value));
    else this.rows[index] = structuredClone(value);
  }
  delete(id: number): Offer {
    const index = this.rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Offre introuvable.');
    return this.rows.splice(index, 1)[0];
  }
  renameShop(previous: string, next: string): void {
    for (const offer of this.rows) {
      if (offer.shop === previous) offer.shop = next;
    }
  }
}
