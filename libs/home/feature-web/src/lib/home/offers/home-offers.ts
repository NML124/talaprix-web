import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideChevronRight } from '@lucide/angular';
import { FavoritesStore, ProductStore } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import { ProductCard } from '@talaprix/products/ui';

@Component({
  selector: 'lib-home-offers',
  imports: [RouterLink, ProductCard, LucideChevronRight],
  templateUrl: './home-offers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeOffers {
  readonly #store = inject(ProductStore);
  readonly #favorites = inject(FavoritesStore);
  readonly #router = inject(Router);
  protected readonly products = this.#store.newest;
  protected readonly status = this.#store.status;
  protected readonly favoriteIds = this.#favorites.ids;
  readonly loadAfterRender = afterNextRender(() => void this.#store.load());

  protected openProduct(product: ProductSummary): void {
    void this.#router.navigate(['/products', product.id]);
  }

  protected toggleFavorite(product: ProductSummary): void {
    this.#favorites.toggle(product.id);
  }
}
