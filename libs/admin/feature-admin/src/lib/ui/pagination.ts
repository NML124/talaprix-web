import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tp-admin-pagination',
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly total = input.required<number>();
  readonly page = input.required<number>();
  readonly pageSize = input(3);
  readonly pageChanged = output<number>();

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  protected readonly first = computed(() =>
    this.total() ? (this.page() - 1) * this.pageSize() + 1 : 0,
  );
  protected readonly last = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );
  protected readonly visiblePages = computed<(number | '…')[]>(() => {
    const count = this.pageCount();
    const current = this.page();
    const numbers = Array.from(
      { length: count },
      (_, index) => index + 1,
    ).filter(
      (number) =>
        number === 1 || number === count || Math.abs(number - current) <= 1,
    );
    const result: (number | '…')[] = [];
    for (const number of numbers) {
      if (result.length && number - Number(result[result.length - 1]) > 1)
        result.push('…');
      result.push(number);
    }
    return result;
  });

  protected select(page: number): void {
    if (page >= 1 && page <= this.pageCount() && page !== this.page()) {
      this.pageChanged.emit(page);
    }
  }
}
