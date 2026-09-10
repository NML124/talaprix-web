import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { CategoryStatus } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-category-status',
  templateUrl: './category-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryStatusPanel {
  readonly status = input.required<CategoryStatus>();
  readonly error = input.required<string>();
  readonly retry = output<void>();
}
