import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Category } from '@talaprix/products/domain';

@Component({
  selector: 'tpx-category-popular',
  imports: [RouterLink],
  templateUrl: './category-popular.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryPopular {
  readonly categories = input.required<readonly Category[]>();
}
