import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@talaprix/cart/data-access';
import type { CartItem, OptimizationStrategy } from '@talaprix/cart/domain';
import { CartEmpty } from './cart-empty/cart-empty';
import { CartOptimizer } from './cart-optimizer/cart-optimizer';
import { CartSummaryCard } from './cart-summary/cart-summary';
import { CartSupplierGroupComponent } from './cart-supplier-group/cart-supplier-group';

@Component({
  selector: 'tpx-cart',
  imports: [
    RouterLink,
    CartEmpty,
    CartOptimizer,
    CartSummaryCard,
    CartSupplierGroupComponent,
  ],
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  readonly #store = inject(CartStore);
  protected readonly items = this.#store.items;
  protected readonly groups = this.#store.groups;
  protected readonly summary = this.#store.summary;
  protected readonly plan = this.#store.plan;
  protected readonly optimizationStatus = this.#store.optimizationStatus;
  protected readonly optimizationError = this.#store.optimizationError;
  protected readonly optimizerOpen = signal(false);
  protected changeQuantity(item: CartItem, delta: number): void {
    this.#store.changeQuantity(item.id, delta);
  }

  protected remove(item: CartItem): void {
    this.#store.remove(item.id);
  }

  protected openOptimizer(): void {
    this.optimizerOpen.set(true);
  }

  protected optimize(strategy: OptimizationStrategy): void {
    void this.#store.optimize(strategy);
  }
}
