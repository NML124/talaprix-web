import { inject, Service, signal } from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';

export interface CatalogShop {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly image: string | null;
  readonly lat: number | null;
  readonly lon: number | null;
}

/**
 * Shops listed on TalaPrix (`get-shops-list`), loaded once per session and
 * shared by the boutiques page and the catalogue filters. A later visit shows
 * the cached list immediately and refreshes it quietly.
 */
@Service()
export class CatalogShopsStore {
  readonly #functions = inject(SupabaseFunctions);
  readonly shops = signal<readonly CatalogShop[]>([]);
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly error = signal('');
  #loadedAt = 0;
  #pending: Promise<void> | null = null;

  load(maxAgeMs = 5 * 60_000): Promise<void> {
    if (this.#pending) return this.#pending;
    if (this.status() === 'ready' && Date.now() - this.#loadedAt < maxAgeMs)
      return Promise.resolve();
    this.#pending = this.#fetch().finally(() => (this.#pending = null));
    return this.#pending;
  }

  async #fetch(): Promise<void> {
    if (this.status() !== 'ready') this.status.set('loading');
    this.error.set('');
    try {
      const response = await this.#functions.get<unknown>('get-shops-list');
      if (!Array.isArray(response))
        throw new Error('Liste des boutiques invalide.');
      this.shops.set(
        response
          .map(mapShop)
          .filter((shop): shop is CatalogShop => shop !== null)
          .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
      );
      this.#loadedAt = Date.now();
      this.status.set('ready');
    } catch (error) {
      if (this.status() === 'ready') return; // Keep the cached list.
      this.error.set(
        error instanceof Error ? error.message : 'Boutiques indisponibles.',
      );
      this.status.set('error');
    }
  }
}

function mapShop(value: unknown): CatalogShop | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = text(row['shop_id']);
  const name = text(row['name']);
  if (!id || !name) return null;
  return {
    id,
    name,
    address: text(row['address']),
    image: text(row['profile_picture']),
    lat: typeof row['lat'] === 'number' ? row['lat'] : null,
    lon: typeof row['lon'] === 'number' ? row['lon'] : null,
  };
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
