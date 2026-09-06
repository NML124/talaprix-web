import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<ProductSummary>();

  protected readonly formatPrice = formatCurrency;
}
