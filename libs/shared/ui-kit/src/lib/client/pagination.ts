import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

/** Numbered pager: first, last, current ±1, with ellipses in between. */
@Component({
  selector: 'tpx-pagination',
  templateUrl: './pagination.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input('Pagination');
  readonly pageChange = output<number>();
  readonly items = computed<readonly (number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages = [...new Set([1, current - 1, current, current + 1, total])]
      .filter((value) => value >= 1 && value <= total)
      .sort((a, b) => a - b);
    return pages.flatMap((value, index) =>
      index > 0 && value - pages[index - 1] > 1 ? [null, value] : [value],
    );
  });

  go(value: number): void {
    if (value < 1 || value > this.totalPages() || value === this.page()) return;
    this.pageChange.emit(value);
  }
}
