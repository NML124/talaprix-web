import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export interface ActiveFilter {
  readonly key: string;
  readonly label: string;
}

@Component({
  selector: 'tpx-client-active-filters',
  templateUrl: './client-active-filters.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientActiveFilters {
  readonly filters = input.required<readonly ActiveFilter[]>();
  readonly remove = output<string>();
  readonly clear = output<void>();
}
