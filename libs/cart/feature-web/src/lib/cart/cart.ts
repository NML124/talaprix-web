import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@talaprix/cart/data-access';
import type { CartItem } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';
import { CartEmpty } from './cart-empty/cart-empty';
import { CartLine } from './cart-line/cart-line';
import { CartSummaryCard } from './cart-summary/cart-summary';

@Component({
  selector: 'tpx-cart',
  imports: [RouterLink, CartEmpty, CartLine, CartSummaryCard],
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  readonly #store = inject(CartStore);
  protected readonly items = this.#store.items;
  protected readonly summary = this.#store.summary;
  protected readonly formatPrice = formatCurrency;

  protected changeQuantity(item: CartItem, delta: number): void {
    this.#store.changeQuantity(item.id, delta);
  }

  protected remove(item: CartItem): void {
    this.#store.remove(item.id);
  }
}
