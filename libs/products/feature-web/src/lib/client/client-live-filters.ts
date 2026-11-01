import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import type { CatalogShop } from '@talaprix/products/data-access';
import type { Category } from '@talaprix/products/domain';

export interface PriceRange {
  readonly min: string;
  readonly max: string;
}

interface CategoryRow {
  readonly category: Category;
  readonly depth: 0 | 1;
}

@Component({
  selector: 'tpx-client-live-filters',
  templateUrl: './client-live-filters.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveFilters {
  readonly categories = input.required<readonly Category[]>();
  readonly categoryId = input('');
  readonly minPrice = input('');
  readonly maxPrice = input('');
  readonly currency = input('FC');
  readonly shops = input<readonly CatalogShop[]>([]);
  readonly shopIds = input<readonly string[]>([]);
  readonly categoryChange = output<string>();
  readonly shopToggle = output<string>();
  readonly shopQuery = signal('');
  /** Selected shops first, then the rest, filtered by the search field. */
  readonly visibleShops = computed(() => {
    const term = normalize(this.shopQuery());
    const selected = new Set(this.shopIds());
    return this.shops()
      .filter((shop) => !term || normalize(`${shop.name} ${shop.address ?? ''}`).includes(term))
      .sort((a, b) => Number(selected.has(b.id)) - Number(selected.has(a.id)));
  });
  readonly priceChange = output<PriceRange>();
  readonly categoryQuery = signal('');
  readonly min = linkedSignal(() => this.minPrice());
  readonly max = linkedSignal(() => this.maxPrice());
  readonly priceInvalid = computed(() => {
    const min = Number(this.min());
    const max = Number(this.max());
    return Boolean(this.min() && this.max()) && min > max;
  });
  readonly rows = computed<readonly CategoryRow[]>(() => {
    const all = this.categories();
    const term = normalize(this.categoryQuery());
    if (term)
      return all
        .filter((category) => normalize(category.name).includes(term))
        .map((category) => ({ category, depth: 0 }));
    const ids = new Set(all.map((category) => category.id));
    const roots = all.filter(
      (category) =>
        !category.parentCategoryId || !ids.has(category.parentCategoryId),
    );
    return roots.flatMap((root) => [
      { category: root, depth: 0 as const },
      ...all
        .filter((category) => category.parentCategoryId === root.id)
        .map((category) => ({ category, depth: 1 as const })),
    ]);
  });

  applyPrice(): void {
    if (this.priceInvalid()) return;
    this.priceChange.emit({ min: this.min().trim(), max: this.max().trim() });
  }
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
