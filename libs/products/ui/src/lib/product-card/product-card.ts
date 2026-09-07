import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  LucideBadgeCheck,
  LucideBoxes,
  LucidePackageCheck,
  LucideStore,
} from '@lucide/angular';
import type { ProductSummary } from '@talaprix/products/domain';
import { formatCurrency } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-product-card',
  imports: [LucideBadgeCheck, LucideBoxes, LucidePackageCheck, LucideStore],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  readonly viewDetails = output<ProductSummary>();

  protected readonly formatPrice = formatCurrency;

  protected viewProduct(): void {
    this.viewDetails.emit(this.product());
  }

  protected stockLabel(): string {
    switch (this.product().stockStatus) {
      case 'limited':
        return 'Stock limité';
      case 'unavailable':
        return 'Indisponible';
      default:
        return 'En stock';
    }
  }
}
