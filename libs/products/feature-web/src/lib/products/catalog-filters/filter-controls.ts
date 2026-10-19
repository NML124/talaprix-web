import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FilterCategories } from './filter-categories';
import { FilterFacets, type FacetSelection } from './filter-facets';
import {
  EMPTY_CATALOG_FILTERS,
  type CatalogFilterSelection,
} from './catalog-filter-models';
import { FilterPrice, type PriceRange } from './filter-price';

@Component({
  selector: 'tpx-filter-controls',
  imports: [FilterCategories, FilterFacets, FilterPrice],
  templateUrl: './filter-controls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterControls {
  readonly categories = input<readonly string[]>([]);
  readonly selection = input<CatalogFilterSelection>(EMPTY_CATALOG_FILTERS);
  readonly selectionChange = output<CatalogFilterSelection>();
  readonly applyRequested = output<void>();
  readonly resetRequested = output<void>();
  protected readonly shops = [
    'Afrimarket',
    'Jumia',
    'Technomarket',
    'Vodacom Shop',
  ];
  protected readonly locations = ['Gombe', 'Limete', 'Kintambo', 'Ngaliema'];
  protected updateCategories(categories: readonly string[]): void {
    this.selectionChange.emit({ ...this.selection(), categories });
  }
  protected updatePrice(range: PriceRange): void {
    this.selectionChange.emit({ ...this.selection(), ...range });
  }
  protected updateFacets(facets: FacetSelection): void {
    this.selectionChange.emit({ ...this.selection(), ...facets });
  }
}
