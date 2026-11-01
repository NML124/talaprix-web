import { Service } from '@angular/core';
import type { CatalogPage, CatalogQuery } from './catalog-api';

const MAX_ENTRIES = 30;

interface Entry {
  readonly page: CatalogPage;
  readonly at: number;
}

/**
 * Recent catalogue pages, keyed by their query. Lets list pages paint the last
 * known result instantly on back navigation while a fresh copy loads.
 */
@Service()
export class CatalogPageCache {
  readonly #entries = new Map<string, Entry>();

  key(query: CatalogQuery): string {
    return JSON.stringify(query, Object.keys(query).sort());
  }

  get(key: string): Entry | null {
    return this.#entries.get(key) ?? null;
  }

  set(key: string, page: CatalogPage): void {
    this.#entries.delete(key);
    this.#entries.set(key, { page, at: Date.now() });
    if (this.#entries.size > MAX_ENTRIES) {
      const oldest = this.#entries.keys().next().value;
      if (oldest !== undefined) this.#entries.delete(oldest);
    }
  }
}
