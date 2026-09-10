import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { CartSummary } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-cart-summary',
  templateUrl: './cart-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryCard {
  readonly summary = input.required<CartSummary>();
  protected readonly formatPrice = formatCurrency;
}
