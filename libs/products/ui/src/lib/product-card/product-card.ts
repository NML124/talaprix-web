import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  readonly viewDetails = output<ProductSummary>();
  protected readonly formatPrice = formatCurrency;
  protected readonly discount = computed(() => {
    const current = this.product().lowestPrice?.amount;
    const previous = this.product().oldPrice?.amount;
    return current && previous && previous > current
      ? Math.round(((previous - current) / previous) * 100)
      : null;
  });

  protected open(event?: Event): void {
    event?.stopPropagation();
    this.viewDetails.emit(this.product());
  }

  protected keepCardActionLocal(event: Event): void {
    event.stopPropagation();
  }
}
