import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ShoppingPlan } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';
import { LucideMapPin, LucideRoute, LucideStore } from '@lucide/angular';

@Component({
  selector: 'tpx-cart-itinerary',
  imports: [LucideMapPin, LucideRoute, LucideStore],
  templateUrl: './cart-itinerary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItinerary {
  readonly plan = input.required<ShoppingPlan>();
  protected readonly formatPrice = formatCurrency;
}
