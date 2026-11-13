import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogShopsStore } from '@talaprix/products/data-access';
import { Pagination } from '@talaprix/shared/ui-kit';

interface Shop {
  readonly id: string;
  readonly name: string;
  readonly address: string | null;
  readonly image: string | null;
  readonly mapUrl: string | null;
}

const PAGE_SIZE = 12;

@Component({
  selector: 'tpx-client-live-shops',
  imports: [RouterLink, Pagination],
  templateUrl: './client-live-shops.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveShops {
  readonly #store = inject(CatalogShopsStore);
  readonly shops = computed<readonly Shop[]>(() =>
    this.#store.shops().map((shop) => ({
      ...shop,
      mapUrl: directionsUrl(shop.lat, shop.lon, shop.address),
    })),
  );
  readonly status = computed(() =>
    this.#store.status() === 'idle' ? 'loading' : this.#store.status(),
  );
  readonly error = this.#store.error;
  readonly q = signal('');
  readonly page = signal(1);
  readonly skeletons = Array.from({ length: 6 }, (_, index) => index);
  readonly filtered = computed(() => {
    const term = normalize(this.q());
    return term
      ? this.shops().filter((shop) =>
          normalize(`${shop.name} ${shop.address ?? ''}`).includes(term),
        )
      : this.shops();
  });
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)),
  );
  readonly visible = computed(() => {
    const start = (Math.min(this.page(), this.totalPages()) - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    this.load();
  }

  load(): void {
    void this.#store.load();
  }

  search(value: string): void {
    this.q.set(value);
    this.page.set(1);
  }

  goToPage(value: number): void {
    this.page.set(value);
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function directionsUrl(
  lat: number | null,
  lon: number | null,
  address: string | null,
): string | null {
  const destination =
    lat !== null &&
    lon !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    (lat !== 0 || lon !== 0)
      ? `${lat},${lon}`
      : address?.trim();
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null;
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr')
    .trim();
}
