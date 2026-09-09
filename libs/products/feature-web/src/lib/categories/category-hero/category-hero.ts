import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tpx-category-hero',
  templateUrl: './category-hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryHero {
  readonly count = input.required<number>();
}
