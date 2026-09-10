import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductStore } from '@talaprix/products/data-access';
import type { ProductSummary } from '@talaprix/products/domain';
import {
  CatalogFilters,
  type CatalogFilterSelection,
} from './catalog-filters/catalog-filters';
import { CatalogGrid } from './catalog-grid/catalog-grid';
import { CatalogHero } from './catalog-hero/catalog-hero';
import { CatalogToolbar } from './catalog-toolbar/catalog-toolbar';

@Component({
  selector: 'tpx-products',
  imports: [CatalogFilters, CatalogGrid, CatalogHero, CatalogToolbar],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  readonly #store = inject(ProductStore);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  protected readonly query = signal('');
  protected readonly category = signal<string | null>(null);
  protected readonly sort = signal<'relevance' | 'price'>('relevance');
  protected readonly status = this.#store.status;
  protected readonly categories = computed(() => [
    ...new Set(
      this.#store
        .items()
        .map((item) => item.categoryName)
        .filter((category): category is string => Boolean(category)),
    ),
  ]);
  protected readonly products = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('fr');
    const category = this.category();
    const products = this.#store.items().filter((item) => {
      const searchable =
        `${item.name} ${item.brandName ?? ''} ${item.categoryName ?? ''}`.toLocaleLowerCase(
          'fr',
        );
      return (
        (!query || searchable.includes(query)) &&
        (!category || item.categoryName === category)
      );
    });
    return this.sort() === 'price'
      ? [...products].sort(
          (a, b) => (a.lowestPrice?.amount ?? 0) - (b.lowestPrice?.amount ?? 0),
        )
      : products;
  });

  readonly loadAfterRender = afterNextRender(() => {
    this.category.set(this.#route.snapshot.queryParamMap.get('category'));
    void this.#store.load();
  });

  protected updateQuery(query: string): void {
    this.query.set(query);
  }

  protected updateFilters(filters: CatalogFilterSelection): void {
    this.category.set(filters.category);
  }

  protected updateSort(sort: 'relevance' | 'price'): void {
    this.sort.set(sort);
  }

  protected openProduct(product: ProductSummary): void {
    void this.#router.navigate(['/products', product.id]);
  }
}
