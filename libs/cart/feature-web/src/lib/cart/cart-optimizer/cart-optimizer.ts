import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type {
  CartSummary,
  OptimizationStrategy,
  ShoppingPlan,
} from '@talaprix/cart/domain';
import {
  LucideLoaderCircle,
  LucideMapPinned,
  LucidePiggyBank,
} from '@lucide/angular';
import { CartItinerary } from '../cart-itinerary/cart-itinerary';

@Component({
  selector: 'tpx-cart-optimizer',
  imports: [
    CartItinerary,
    LucideLoaderCircle,
    LucideMapPinned,
    LucidePiggyBank,
  ],
  templateUrl: './cart-optimizer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartOptimizer {
  readonly summary = input.required<CartSummary>();
  readonly status = input.required<'idle' | 'loading' | 'success' | 'error'>();
  readonly plan = input.required<ShoppingPlan | null>();
  readonly error = input.required<string | null>();
  readonly strategySelected = output<OptimizationStrategy>();
}
