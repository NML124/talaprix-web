import {
  computed,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type { ProductId } from '@talaprix/products/domain';

/** In-memory adapter. It can later be replaced by the authenticated API. */
@Service({ autoProvided: false })
export class FavoritesStore {
  readonly #ids = signal<readonly ProductId[]>([]);
  readonly ids = this.#ids.asReadonly();
  readonly count = computed(() => this.#ids().length);

  contains(productId: ProductId): boolean {
    return this.#ids().includes(productId);
  }

  toggle(productId: ProductId): void {
    this.#ids.update((ids) =>
      ids.includes(productId)
        ? ids.filter((id) => id !== productId)
        : [...ids, productId],
    );
  }
}

export function provideFavoritesDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([FavoritesStore]);
}
