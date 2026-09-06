import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',
  imports: [],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();

  protected readonly formatPrice = formatCurrency;
}
