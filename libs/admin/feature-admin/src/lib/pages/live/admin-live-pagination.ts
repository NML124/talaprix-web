import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'tp-admin-live-pagination',
  templateUrl: './admin-live-pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLivePagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly pageSize = input(30);
  readonly loading = input(false);
  readonly changed = output<number>();
  protected readonly Math = Math;
  protected readonly pages = computed(() => {
    const current = this.page();
    const total = this.totalPages();
    const first = Math.max(1, current - 2);
    const last = Math.min(total, current + 2);
    return Array.from(
      { length: last - first + 1 },
      (_, index) => first + index,
    );
  });
}
