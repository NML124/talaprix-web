import {
  computed,
  inject,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type {
  CartItem,
  CartSummary,
  CartSupplierGroup,
  OptimizationStrategy,
  ShoppingPlan,
} from '@talaprix/cart/domain';
import { CartOptimizationAdapter } from './cart-optimization-adapter';
import { CART_FIXTURES } from './cart-fixtures';

@Service({ autoProvided: false })
export class CartStore {
  readonly #optimizationAdapter = inject(CartOptimizationAdapter);
  readonly #items = signal<readonly CartItem[]>(CART_FIXTURES);
  readonly #plan = signal<ShoppingPlan | null>(null);
  readonly #optimizationStatus = signal<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  readonly #optimizationError = signal<string | null>(null);
  readonly items = this.#items.asReadonly();
  readonly plan = this.#plan.asReadonly();
  readonly optimizationStatus = this.#optimizationStatus.asReadonly();
  readonly optimizationError = this.#optimizationError.asReadonly();
  readonly groups = computed<readonly CartSupplierGroup[]>(() => {
    const supplierItems = new Map<string, CartItem[]>();
    for (const item of this.#items()) {
      supplierItems.set(item.shopName, [
        ...(supplierItems.get(item.shopName) ?? []),
        item,
      ]);
    }
    return [...supplierItems.entries()].map(([shopName, items]) => ({
      shopName,
      area: items[0].area,
      address: items[0].address,
      distanceKm: items[0].distanceKm,
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      ),
    }));
  });
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
    this.resetPlan();
  }

  remove(id: string): void {
    this.#items.update((items) => items.filter((item) => item.id !== id));
    this.resetPlan();
  }

  async optimize(strategy: OptimizationStrategy): Promise<void> {
    if (!this.#items().length) {
      return;
    }

    this.#optimizationStatus.set('loading');
    this.#optimizationError.set(null);
    try {
      this.#plan.set(
        await this.#optimizationAdapter.optimize(this.#items(), strategy),
      );
      this.#optimizationStatus.set('success');
    } catch {
      this.#optimizationStatus.set('error');
      this.#optimizationError.set(
        'Impossible de préparer votre itinéraire. Réessayez dans un instant.',
      );
    }
  }

  resetPlan(): void {
    this.#plan.set(null);
    this.#optimizationStatus.set('idle');
    this.#optimizationError.set(null);
  }
}

export function provideCartDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([CartStore, CartOptimizationAdapter]);
}
