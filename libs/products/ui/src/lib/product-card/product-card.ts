import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';

import {
  LucideChevronRight,
  LucideHeart,
  LucideMinus,
  LucidePlus,
  LucideShoppingBasket,
  LucideStore,
} from '@lucide/angular';

import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',

  imports: [
    LucideChevronRight,
    LucideHeart,
    LucideMinus,
    LucidePlus,
    LucideShoppingBasket,
    LucideStore,
  ],

  templateUrl: './product-card.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();

  readonly viewDetails = output<ProductSummary>();

  protected readonly formatPrice = formatCurrency;

  protected readonly isFavorite = signal(false);

  protected readonly cartQuantity = signal(0);

  protected open(event?: Event): void {
    event?.stopPropagation();

    this.viewDetails.emit(this.product());
  }

  protected toggleFavorite(event: Event): void {
    event.stopPropagation();

    this.isFavorite.update((value) => !value);
  }

  protected addToCart(event: Event): void {
    event.stopPropagation();

    this.cartQuantity.set(1);
  }

  protected increaseQuantity(event: Event): void {
    event.stopPropagation();

    this.cartQuantity.update(
      (quantity) => quantity + 1,
    );
  }

  protected decreaseQuantity(event: Event): void {
    event.stopPropagation();

    const quantity = this.cartQuantity();

    if (quantity <= 1) {
      this.cartQuantity.set(0);
      return;
    }

    this.cartQuantity.set(quantity - 1);
  }
}