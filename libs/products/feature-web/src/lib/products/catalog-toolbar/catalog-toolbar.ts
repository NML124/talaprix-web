import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tpx-catalog-toolbar',
  templateUrl: './catalog-toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogToolbar {
  readonly count = input(0);
  readonly sort = input<'relevance' | 'price'>('relevance');
  readonly sortChange = output<'relevance' | 'price'>();

  protected updateSort(event: Event): void {
    const select = event.target;
    if (select instanceof HTMLSelectElement) {
      this.sortChange.emit(select.value as 'relevance' | 'price');
    }
  }
}
