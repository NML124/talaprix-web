import { computed, inject, Service, signal } from '@angular/core';
import {
  CatalogApi,
  CatalogShopsStore,
  type CatalogReference,
} from '@talaprix/products/data-access';

const MAX_AGE_MS = 15 * 60_000;

/**
 * Home page data kept for the whole session. Coming back to the home page
 * shows the last result immediately; it is refreshed quietly once stale.
 */
@Service()
export class HomeCatalogStore {
  readonly #catalog = inject(CatalogApi);
  readonly #shops = inject(CatalogShopsStore);
  readonly products = signal<readonly CatalogReference[]>([]);
  readonly usdToCdf = signal<number | null>(null);
  readonly shops = computed(() => this.#shops.shops().slice(0, 6));
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal('');
  #loadedAt = 0;
  #pending: Promise<void> | null = null;

  load(force = false): Promise<void> {
    void this.#shops.load();
    if (this.#pending) return this.#pending;
    const fresh = Date.now() - this.#loadedAt < MAX_AGE_MS;
    if (!force && this.status() === 'ready' && fresh) return Promise.resolve();
    this.#pending = this.#fetch().finally(() => (this.#pending = null));
    return this.#pending;
  }

  async #fetch(): Promise<void> {
    if (this.status() !== 'ready') this.status.set('loading');
    this.error.set('');
    try {
      const page = await this.#catalog.list({
        page: 1,
        limit: 24,
        sort: 'name_asc',
      });
      this.products.set(page.items);
      this.usdToCdf.set(page.usdToCdf);
      this.#loadedAt = Date.now();
      this.status.set('ready');
    } catch (error) {
      if (this.status() === 'ready') return; // Keep what is on screen.
      this.error.set(
        error instanceof Error ? error.message : 'Catalogue indisponible.',
      );
      this.status.set('error');
    }
  }
}
