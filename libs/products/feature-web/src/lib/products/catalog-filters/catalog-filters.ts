import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { LucideSlidersHorizontal } from '@lucide/angular';

export interface CatalogFilterSelection {
  readonly category: string | null;
}

@Component({
  selector: 'tpx-catalog-filters',
  imports: [LucideSlidersHorizontal],
  templateUrl: './catalog-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFilters {
  readonly categories = input<readonly string[]>([]);
  readonly selectedCategory = input<string | null>(null);
  readonly filtersChange = output<CatalogFilterSelection>();

  protected select(category: string | null): void {
    this.filtersChange.emit({ category });
  }
}
