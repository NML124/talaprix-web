import { DestroyRef, inject, Service, signal } from '@angular/core';
import { CatalogSearchApi, type CatalogSuggestion } from './catalog-search-api';

export type CatalogSearchStatus =
  | 'idle'
  | 'short'
  | 'loading'
  | 'results'
  | 'empty'
  | 'error';

export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 100;
export const SEARCH_DEBOUNCE_MS = 280;

/**
 * Live produit suggestions for one search field. Scoped: each field provides
 * its own instance so the header dropdown and the search page never share
 * pending requests. Stale responses are dropped by aborting the previous one.
 */
@Service({ autoProvided: false })
export class CatalogSearchStore {
  readonly #api = inject(CatalogSearchApi);
  readonly #status = signal<CatalogSearchStatus>('idle');
  readonly #items = signal<readonly CatalogSuggestion[]>([]);
  readonly #query = signal('');
  #timer: ReturnType<typeof setTimeout> | null = null;
  #controller: AbortController | null = null;
  #limit = 8;
  readonly status = this.#status.asReadonly();
  readonly items = this.#items.asReadonly();
  /** Trimmed query the current status refers to. */
  readonly query = this.#query.asReadonly();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.#cancel());
  }

  search(raw: string, limit = this.#limit): void {
    const query = raw.trim().slice(0, SEARCH_MAX_LENGTH);
    this.#limit = limit;
    if (query === this.#query() && this.#status() !== 'error') return;
    this.#cancel();
    this.#query.set(query);
    if (!query) {
      this.#items.set([]);
      this.#status.set('idle');
      return;
    }
    if (query.length < SEARCH_MIN_LENGTH) {
      this.#items.set([]);
      this.#status.set('short');
      return;
    }
    this.#status.set('loading');
    this.#timer = setTimeout(() => void this.#fetch(query), SEARCH_DEBOUNCE_MS);
  }

  retry(): void {
    const query = this.#query();
    this.#query.set('');
    this.search(query);
  }

  async #fetch(query: string): Promise<void> {
    const controller = new AbortController();
    this.#controller = controller;
    try {
      const items = await this.#api.suggest(
        query,
        this.#limit,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      this.#items.set(items);
      this.#status.set(items.length ? 'results' : 'empty');
    } catch {
      if (controller.signal.aborted) return;
      this.#items.set([]);
      this.#status.set('error');
    } finally {
      if (this.#controller === controller) this.#controller = null;
    }
  }

  #cancel(): void {
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = null;
    this.#controller?.abort();
    this.#controller = null;
  }
}
