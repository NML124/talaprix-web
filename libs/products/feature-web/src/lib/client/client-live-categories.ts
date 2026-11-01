import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryStore } from '@talaprix/products/data-access';
import type { Category } from '@talaprix/products/domain';

const TILE_RATIOS = [
  'aspect-[4/5]',
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[5/4]',
  'aspect-[2/3]',
] as const;

@Component({
  selector: 'tpx-client-live-categories',
  imports: [RouterLink],
  templateUrl: './client-live-categories.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveCategories {
  readonly store = inject(CategoryStore);
  readonly skeletons = TILE_RATIOS.concat(TILE_RATIOS);
  readonly childCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const category of this.store.categories()) {
      const parent = category.parentCategoryId;
      if (parent) counts.set(parent, (counts.get(parent) ?? 0) + 1);
    }
    return counts;
  });

  constructor() {
    void this.store.load();
  }

  ratio(index: number): string {
    return TILE_RATIOS[index % TILE_RATIOS.length];
  }

  caption(category: Category): string {
    const children = this.childCounts().get(category.id) ?? 0;
    if (children > 0)
      return `${children} sous-catégorie${children > 1 ? 's' : ''}`;
    return category.parentName ?? 'Voir les produits';
  }
}
