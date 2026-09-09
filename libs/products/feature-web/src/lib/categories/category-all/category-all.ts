import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CategoryFamily } from '../category-family';

@Component({
  selector: 'tpx-category-all',
  imports: [RouterLink],
  templateUrl: './category-all.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryAll {
  readonly families = input.required<readonly CategoryFamily[]>();
}
