import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export interface CatalogActiveFilter {
  readonly key: string;
  readonly label: string;
}

export type CatalogSort =
  | 'relevance'
  | 'price';

export type CatalogViewMode =
  | 'grid'
  | 'list';

@Component({
  selector: 'tpx-catalog-toolbar',

  templateUrl:
    './catalog-toolbar.html',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class CatalogToolbar {
  readonly count =
    input(0);

  readonly sort =
    input<CatalogSort>(
      'relevance',
    );

  readonly viewMode =
    input<CatalogViewMode>(
      'grid',
    );

  readonly activeFilters =
    input<
      readonly CatalogActiveFilter[]
    >([]);


  readonly sortChange =
    output<CatalogSort>();

  readonly viewModeChange =
    output<CatalogViewMode>();

  readonly removeFilter =
    output<string>();

  readonly clearFilters =
    output<void>();


  protected updateSort(
    event: Event,
  ): void {
    const target =
      event.target;

    if (
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }

    this.sortChange.emit(
      target.value as CatalogSort,
    );
  }


  protected setViewMode(
    mode: CatalogViewMode,
  ): void {
    this.viewModeChange.emit(
      mode,
    );
  }


  protected remove(
    key: string,
  ): void {
    this.removeFilter.emit(
      key,
    );
  }


  protected clear(): void {
    this.clearFilters.emit();
  }
}