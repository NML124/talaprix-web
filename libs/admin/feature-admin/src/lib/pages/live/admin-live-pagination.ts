import {
  ChangeDetectionStrategy,
  Component,
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
  readonly changed = output<number>();
}
