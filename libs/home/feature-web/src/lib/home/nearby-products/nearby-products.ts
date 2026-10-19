import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideMapPin, LucideTag } from '@lucide/angular';
import { NEARBY_PRODUCT_FIXTURES } from './nearby-product-fixtures';
import type { NearbyProduct } from './nearby-product';
import { NearbyShowcase } from './nearby-showcase';

export type { NearbyProduct } from './nearby-product';

@Component({
  selector: 'lib-nearby-products',
  imports: [
    RouterLink,
    LucideArrowRight,
    LucideMapPin,
    LucideTag,
    NearbyShowcase,
  ],
  templateUrl: './nearby-products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NearbyProducts {
  readonly products = input<readonly NearbyProduct[]>([]);
  readonly autoplayDelay = input(4500);
  protected readonly displayedProducts = computed(() =>
    (this.products().length ? this.products() : NEARBY_PRODUCT_FIXTURES).slice(
      0,
      5,
    ),
  );
}
