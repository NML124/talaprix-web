import {
  computed,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type { ShopSummary } from '@talaprix/shops/domain';
import { SHOP_FIXTURES } from './shop-fixtures';

@Service({ autoProvided: false })
export class ShopStore {
  readonly #items = signal<readonly ShopSummary[]>(SHOP_FIXTURES);
  readonly items = this.#items.asReadonly();
  readonly openShops = computed(() =>
    this.#items().filter((shop) => shop.isOpen),
  );
}

export function provideShopDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([ShopStore]);
}
