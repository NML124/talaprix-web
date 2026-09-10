import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ShopStore } from '@talaprix/shops/data-access';
import { ShopCard } from './shop-card/shop-card';
import { ShopHero } from './shop-hero/shop-hero';

@Component({
  selector: 'tpx-shops',
  imports: [ShopCard, ShopHero],
  templateUrl: './shops.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopsPage {
  readonly #store = inject(ShopStore);
  protected readonly query = signal('');
  protected readonly shops = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('fr');
    return query
      ? this.#store
          .items()
          .filter((shop) => shop.name.toLocaleLowerCase('fr').includes(query))
      : this.#store.items();
  });

  protected updateQuery(query: string): void {
    this.query.set(query);
  }
}
