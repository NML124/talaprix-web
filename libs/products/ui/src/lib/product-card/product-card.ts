import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  LucideCheck,
  LucideChevronRight,
  LucideMapPin,
  LucideStore,
} from '@lucide/angular';
import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',
  imports: [LucideCheck, LucideChevronRight, LucideMapPin, LucideStore],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  readonly viewDetails = output<ProductSummary>();
  protected readonly formatPrice = formatCurrency;

  protected open(event?: Event): void {
    event?.stopPropagation();
    this.viewDetails.emit(this.product());
  }
}
