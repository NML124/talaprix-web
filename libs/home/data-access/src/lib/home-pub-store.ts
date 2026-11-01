import { inject, Service, signal } from '@angular/core';
import { HomeDataService } from './home-data-service';

/** Active advertisement (`get-pub`), already ordered by priority. */
export interface HomePub {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly shopName: string | null;
}

/** Loads the ads once per session; later visits reuse them instantly. */
@Service()
export class HomePubStore {
  readonly #data = inject(HomeDataService);
  readonly pubs = signal<readonly HomePub[]>([]);
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');

  async load(): Promise<void> {
    if (this.status() === 'loading' || this.status() === 'ready') return;
    this.status.set('loading');
    try {
      const response = await this.#data.getPromotions();
      this.pubs.set(Array.isArray(response) ? response.flatMap(mapPub) : []);
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }
}

function mapPub(value: unknown): HomePub[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const row = value as Record<string, unknown>;
  const id = row['pub_id'];
  const image = row['image'];
  if (typeof id !== 'string' || typeof image !== 'string' || !image) return [];
  return [
    {
      id,
      image,
      name: typeof row['name'] === 'string' ? row['name'] : '',
      shopName: typeof row['shop_name'] === 'string' ? row['shop_name'] : null,
    },
  ];
}
