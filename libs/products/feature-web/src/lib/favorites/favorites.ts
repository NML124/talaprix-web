import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FavoritesStore, ProductStore } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import { ProductCard } from '@talaprix/products/ui';

@Component({
  selector: 'tpx-favorites',
  imports: [ProductCard, RouterLink],
  templateUrl: './favorites.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Favorites {
  readonly #products = inject(ProductStore);
  readonly #favorites = inject(FavoritesStore);
  readonly #router = inject(Router);
  protected readonly favoriteIds = this.#favorites.ids;
  protected readonly items = computed(() => {
    const ids = this.favoriteIds();
    return this.#products.items().filter((item) => ids.includes(item.id));
  });
  readonly loadAfterRender = afterNextRender(() => void this.#products.load());

  protected open(product: ProductSummary): void {
    void this.#router.navigate(['/products', product.id]);
  }

  protected toggle(product: ProductSummary): void {
    this.#favorites.toggle(product.id);
  }
}
