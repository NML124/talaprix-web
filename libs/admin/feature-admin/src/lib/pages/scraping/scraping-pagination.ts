import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tp-scraping-pagination',
  templateUrl: './scraping-pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapingPagination {
  readonly offset = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly count = input.required<number>();
  readonly hasNext = input.required<boolean>();
  readonly loading = input.required<boolean>();
  readonly pageSelected = output<number>();

  protected readonly currentPage = computed(
    () => Math.floor(this.offset() / this.pageSize()) + 1,
  );
  protected readonly pages = computed(() => {
    const current = this.currentPage();
    const first = Math.max(1, current - 2);
    const last = current + (this.hasNext() ? 1 : 0);
    return Array.from(
      { length: last - first + 1 },
      (_, index) => first + index,
    );
  });

  protected select(page: number): void {
    if (
      this.loading() ||
      page < 1 ||
      page > this.currentPage() + Number(this.hasNext())
    )
      return;
    this.pageSelected.emit((page - 1) * this.pageSize());
  }
}
