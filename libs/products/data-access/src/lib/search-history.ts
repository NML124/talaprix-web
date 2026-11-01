import { isPlatformBrowser } from '@angular/common';
import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { AuthGate } from '@talaprix/shared/data-access';

const KEY_PREFIX = 'talaprix.web.search-history.v1.';
const MAX_ITEMS = 8;

/**
 * Names of the produits the visitor opened from search, kept on this device
 * and separated by account (`guest` before login). Raw queries are never kept.
 */
@Service()
export class SearchHistory {
  readonly #auth = inject(AuthGate);
  readonly #browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #revision = signal(0);
  readonly #key = computed(() => KEY_PREFIX + (this.#auth.userId() ?? 'guest'));
  readonly items = computed<readonly string[]>(() => {
    this.#revision();
    return this.#read(this.#key());
  });

  add(name: string): void {
    const clean = name.trim();
    if (clean.length < 2 || clean.length > 100) return;
    const lower = clean.toLowerCase();
    this.#write([
      clean,
      ...this.items().filter((item) => item.toLowerCase() !== lower),
    ]);
  }

  clear(): void {
    if (!this.#browser) return;
    try {
      localStorage.removeItem(this.#key());
    } catch {
      // Storage can be blocked; the history then simply stays empty.
    }
    this.#revision.update((value) => value + 1);
  }

  #read(key: string): readonly string[] {
    if (!this.#browser) return [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(parsed)
        ? parsed
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length >= 2 && item.length <= 100)
            .slice(0, MAX_ITEMS)
        : [];
    } catch {
      return [];
    }
  }

  #write(items: readonly string[]): void {
    if (!this.#browser) return;
    try {
      localStorage.setItem(
        this.#key(),
        JSON.stringify(items.slice(0, MAX_ITEMS)),
      );
    } catch {
      // Storage can be full or blocked; search keeps working without history.
    }
    this.#revision.update((value) => value + 1);
  }
}
