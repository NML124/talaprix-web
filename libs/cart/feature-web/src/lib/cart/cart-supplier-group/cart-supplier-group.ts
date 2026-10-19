import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import type { CartItem, CartSupplierGroup } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';
import { LucideChevronDown, LucideMapPin, LucideStore } from '@lucide/angular';
import { CartLine } from '../cart-line/cart-line';

@Component({
  selector: 'tpx-cart-supplier-group',
  imports: [CartLine, LucideChevronDown, LucideMapPin, LucideStore],
  templateUrl: './cart-supplier-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSupplierGroupComponent {
  readonly group = input.required<CartSupplierGroup>();
  readonly quantityChange = output<{ item: CartItem; delta: number }>();
  readonly itemRemove = output<CartItem>();
  protected readonly expanded = signal(true);
  protected readonly formatPrice = formatCurrency;

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }
}
