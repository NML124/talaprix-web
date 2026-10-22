import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Pagination } from '../../ui/pagination';
import { ShopStore, formatShopPrice } from '../shop-store';

@Component({
  selector: 'tp-shop-reductions-page',
  imports: [Pagination],
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-reductions-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopReductionsPage {
  protected readonly store = inject(ShopStore);
  protected readonly price = formatShopPrice;
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly promotions = computed(
    () => this.store.data()?.discounts ?? [],
  );
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
