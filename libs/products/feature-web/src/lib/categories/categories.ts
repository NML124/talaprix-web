import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CategoryStore } from '@talaprix/products/data-access';
import { CategoryAll } from './category-all/category-all';
import { CategoryHero } from './category-hero/category-hero';
import { CategoryPopular } from './category-popular/category-popular';
import { CategoryStatusPanel } from './category-status/category-status';
import { groupCategories } from './category-family';

@Component({
  selector: 'tpx-products-categories',
  imports: [CategoryAll, CategoryHero, CategoryPopular, CategoryStatusPanel],
  templateUrl: './categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCategories {
  readonly #store = inject(CategoryStore);
  protected readonly categories = this.#store.categories;
  protected readonly families = computed(() =>
    groupCategories(this.categories()),
  );
  protected readonly status = this.#store.status;
  protected readonly error = this.#store.error;

  constructor() {
    afterNextRender(() => void this.#store.load());
  }

  protected retry(): void {
    void this.#store.load();
  }
}
