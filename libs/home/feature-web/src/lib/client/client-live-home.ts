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
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { productImageSrcset, productImageUrl } from '@talaprix/shared/utils';

@Component({
  selector: 'lib-client-live-home',
  imports: [RouterLink],
  templateUrl: './client-live-home.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveHome {
  readonly imageUrl = productImageUrl;
  readonly imageSrcset = (source: string | null) =>
    productImageSrcset(source, [320, 640]);
  readonly #store = inject(HomeCatalogStore);
  readonly #preferences = inject(PreviewPreferences);
  readonly #categories = inject(CategoryStore);
  readonly cartActions = inject(CatalogCartActions);
  readonly cart = this.cartActions.cart;
  readonly favorites = inject(LiveFavoritesStore);
  readonly cartError = this.cartActions.error;
  readonly products = this.#store.products;
  readonly shops = this.#store.shops;
  readonly categories = this.#categories.displayCategories;
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
    const selected = this.#preferences.currency();
    const rate = this.#store.usdToCdf();
    const amount =
      selected === item.currency
        ? item.price
        : selected === 'CDF'
          ? item.normalizedPriceCdf
          : rate && rate > 0
            ? item.normalizedPriceCdf / rate
            : item.price;
    const currency =
      selected === item.currency || selected === 'CDF' || (rate && rate > 0)
        ? selected
        : item.currency;
    return `${new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: currency === 'CDF' ? 0 : 2,
    }).format(amount)} ${currency === 'CDF' ? 'FC' : 'USD'}`;
  }
}
