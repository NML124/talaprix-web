import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'tpx-filter-categories',
  templateUrl: './filter-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterCategories {
  readonly categories = input<readonly string[]>([]);
  readonly selected = input<readonly string[]>([]);
  readonly selectedChange = output<readonly string[]>();
  protected readonly search = signal('');
  protected readonly visibleCategories = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('fr');
    return query
      ? this.categories().filter((item) =>
          item.toLocaleLowerCase('fr').includes(query),
        )
      : this.categories();
  });

  protected updateSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement)
      this.search.set(event.target.value);
  }

  protected toggle(category: string): void {
    const selected = this.selected();
    this.selectedChange.emit(
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );
  }
}
