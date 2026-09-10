import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductStore } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import { ProductCard } from '@talaprix/products/ui';

@Component({
  selector: 'lib-home-offers',
  imports: [RouterLink, ProductCard],
  templateUrl: './home-offers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeOffers {
  readonly #store = inject(ProductStore);
  readonly #router = inject(Router);
  protected readonly products = this.#store.newest;
  protected readonly nearbyProducts = computed(() =>
    this.products().slice(0, 3),
  );
  protected readonly status = this.#store.status;
  readonly loadAfterRender = afterNextRender(() => void this.#store.load());

  protected openProduct(product: ProductSummary): void {
    void this.#router.navigate(['/products', product.id]);
  }
}
