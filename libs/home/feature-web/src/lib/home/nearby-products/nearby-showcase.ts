import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideMapPin,
  LucideShoppingBag,
} from '@lucide/angular';
import { formatCurrency } from '@talaprix/shared/utils';
import type { NearbyProduct } from './nearby-product';

@Component({
  selector: 'lib-nearby-showcase',
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
    LucideMapPin,
    LucideShoppingBag,
  ],
  templateUrl: './nearby-showcase.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NearbyShowcase implements OnInit, OnDestroy {
  readonly products = input<readonly NearbyProduct[]>([]);
  readonly autoplayDelay = input(4500);
  protected readonly activeIndex = signal(0);
  protected readonly paused = signal(false);
  protected readonly activeProduct = computed(
    () =>
      this.products()[
        Math.min(this.activeIndex(), Math.max(this.products().length - 1, 0))
      ] ?? null,
  );
  protected readonly formatPrice = formatCurrency;
  #timer: ReturnType<typeof setInterval> | null = null;
  ngOnInit(): void {
    this.#timer = setInterval(() => {
      if (!this.paused()) this.nextProduct();
    }, this.autoplayDelay());
  }
  ngOnDestroy(): void {
    if (this.#timer) clearInterval(this.#timer);
  }
  protected setPaused(paused: boolean): void {
    this.paused.set(paused);
  }
  protected selectProduct(index: number): void {
    if (index >= 0 && index < this.products().length)
      this.activeIndex.set(index);
  }
  protected nextProduct(): void {
    const count = this.products().length;
    if (count > 1) this.activeIndex.update((index) => (index + 1) % count);
  }
  protected previousProduct(): void {
    const count = this.products().length;
    if (count > 1)
      this.activeIndex.update((index) => (index - 1 + count) % count);
  }
}
