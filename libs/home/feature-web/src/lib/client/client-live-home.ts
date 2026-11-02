import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CategoryStore,
  CatalogCartActions,
  LiveFavoritesStore,
  type CatalogReference,
} from '@talaprix/products/data-access';
import { HomeCatalogStore } from '@talaprix/home/data-access';

@Component({
  selector: 'lib-client-live-home',
  imports: [RouterLink],
  templateUrl: './client-live-home.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveHome {
  readonly #store = inject(HomeCatalogStore);
  readonly #categories = inject(CategoryStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartPending = this.cartActions.pending;
  readonly cartError = this.cartActions.error;
  readonly products = this.#store.products;
  readonly shops = this.#store.shops;
  readonly categories = this.#categories.categories;
  readonly status = computed(() =>
    this.#store.status() === 'idle' ? 'loading' : this.#store.status(),
  );
  readonly error = this.#store.error;

  constructor() {
    void this.#categories.load();
    void this.#store.load();
  }

  load(): void {
    void this.#store.load(true);
  }

  addToCart(item: CatalogReference): void {
    this.cartActions.add(item);
  }

  price(item: CatalogReference): string {
    return `${new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: item.currency === 'CDF' ? 0 : 2,
    }).format(item.price)} ${item.currency === 'CDF' ? 'FC' : 'USD'}`;
  }
}
