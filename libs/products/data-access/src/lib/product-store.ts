import {
  computed,
  makeEnvironmentProviders,
  Service,
  signal,
  type EnvironmentProviders,
} from '@angular/core';
import type { ProductDetail } from '@talaprix/products/domain';
import { PRODUCT_FIXTURES } from './product-fixtures';

export type ProductStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

@Service({ autoProvided: false })
export class ProductStore {
  readonly #items = signal<readonly ProductDetail[]>([]);
  readonly #status = signal<ProductStatus>('idle');
  readonly #error = signal('');
  readonly items = this.#items.asReadonly();
  readonly status = this.#status.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly newest = computed(() => this.#items().slice(0, 6));

  async load(): Promise<void> {
    this.#status.set('loading');
    this.#error.set('');
    // TODO(api): remplacer cette source par get-search-products / get-products.
    await Promise.resolve();
    this.#items.set(PRODUCT_FIXTURES);
    this.#status.set(this.#items().length ? 'success' : 'empty');
  }

  findById(id: string): ProductDetail | null {
    return (
      this.#items().find((item) => item.id === id) ??
      PRODUCT_FIXTURES.find((item) => item.id === id) ??
      null
    );
  }
}

export function provideProductDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([ProductStore]);
}
