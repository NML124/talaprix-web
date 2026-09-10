import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { CartItem } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-cart-line',
  templateUrl: './cart-line.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartLine {
  readonly item = input.required<CartItem>();
  readonly quantityChange = output<number>();
  readonly itemRemove = output<void>();
  protected readonly formatPrice = formatCurrency;
}
