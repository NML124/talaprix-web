import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { CartSummary } from '@talaprix/cart/domain';
import { formatCurrency } from '@talaprix/shared/utils';
import { LucideArrowRight, LucideSparkles } from '@lucide/angular';

@Component({
  selector: 'tpx-cart-summary',
  imports: [LucideArrowRight, LucideSparkles],
  templateUrl: './cart-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryCard {
  readonly summary = input.required<CartSummary>();
  readonly optimizerOpen = input.required<boolean>();
  readonly optimizeRequested = output<void>();
  protected readonly formatPrice = formatCurrency;
}
