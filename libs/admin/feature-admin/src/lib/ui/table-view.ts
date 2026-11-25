import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  signal,
} from '@angular/core';
import { AdminSelect } from './admin-select';
@Component({
  selector: 'tp-table-view',
  imports: [AdminSelect],
  host: { class: 'block px-4 py-3' },
  templateUrl: './table-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableView<T extends object> {
  readonly rows = input.required<readonly T[]>();
  readonly sortKey = input('');
  readonly chronological = input(false);
  readonly order = signal('asc');
  readonly visible = computed(() => {
    const rows = this.rows();
    const key = this.sortKey() as keyof T;
    const direction = this.order() === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        direction *
        String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'fr', {
          numeric: true,
        }),
    );
  });
}
