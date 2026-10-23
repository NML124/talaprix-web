import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Pagination } from '../../ui/pagination';
import { FormsModule } from '@angular/forms';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';
import type { ShopDiscount } from '../shop-models';
import { ShopStore, formatShopPrice } from '../shop-store';

@Component({
  selector: 'tp-shop-reductions-page',
  imports: [Pagination, FormsModule, AdminDialog, AdminSelect],
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-reductions-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopReductionsPage {
  protected readonly store = inject(ShopStore);
  protected readonly price = formatShopPrice;
  protected readonly page = signal(1);
  protected readonly draft = signal<ShopDiscount | null>(null);
  protected readonly deleting = signal(false);
  protected readonly error = signal('');
  protected readonly pageSize = 10;
  protected readonly promotions = computed(
    () => this.store.data()?.discounts ?? [],
  );
  protected readonly offerOptions = computed(
    () => this.store.data()?.offers.map((row) => row.product) ?? [],
  );
  protected openCreate(): void {
    const offer = this.store.data()?.offers[0];
    if (!offer) return;
    this.draft.set({
      id: `promo-${Date.now()}`,
      shopId: offer.shopId,
      offerId: offer.id,
      product: offer.product,
      oldPrice: offer.price,
      newPrice: Math.max(1, offer.price - 1),
      period: 'À définir',
      status: 'Prévue',
    });
  }
  protected edit(row: ShopDiscount): void {
    this.draft.set(structuredClone(row));
  }
  protected chooseOffer(product: string): void {
    const offer = this.store
      .data()
      ?.offers.find((row) => row.product === product);
    if (offer)
      this.draft.update((value) =>
        value
          ? {
              ...value,
              offerId: offer.id,
              product: offer.product,
              shopId: offer.shopId,
              oldPrice: offer.price,
              newPrice: Math.min(value.newPrice, offer.price - 1),
            }
          : value,
      );
  }
  protected save(): void {
    const row = this.draft();
    if (!row) return;
    if (!row.period.trim() || !this.store.saveDiscount(row)) {
      this.error.set(
        'Choisissez une offre, une période et un prix inférieur au prix habituel.',
      );
      return;
    }
    this.draft.set(null);
    this.error.set('');
  }
  protected change(
    field: 'newPrice' | 'period' | 'status',
    value: number | string,
  ): void {
    this.draft.update((row) => (row ? { ...row, [field]: value } : row));
  }
  protected remove(): void {
    const row = this.draft();
    if (row && this.store.deleteDiscount(row.id)) {
      this.draft.set(null);
      this.deleting.set(false);
    }
  }
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.promotions().length / this.pageSize)),
    ),
  );
  protected readonly visiblePromotions = computed(() =>
    this.promotions().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
}
