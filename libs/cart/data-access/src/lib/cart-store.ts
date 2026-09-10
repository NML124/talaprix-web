import {
  computed,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type { CartItem, CartSummary } from '@talaprix/cart/domain';
import { CART_FIXTURES } from './cart-fixtures';

@Service({ autoProvided: false })
export class CartStore {
  readonly #items = signal<readonly CartItem[]>(CART_FIXTURES);
  readonly items = this.#items.asReadonly();
  readonly summary = computed<CartSummary>(() => {
    const items = this.#items();
    const subtotal = items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
    const savings = items.reduce(
      (total, item) => total + item.saving * item.quantity,
      0,
    );
    return {
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal,
      savings,
      total: subtotal,
    };
  });

  changeQuantity(id: string, delta: number): void {
    this.#items.update((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  }

  remove(id: string): void {
    this.#items.update((items) => items.filter((item) => item.id !== id));
  }
}

export function provideCartDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([CartStore]);
}
