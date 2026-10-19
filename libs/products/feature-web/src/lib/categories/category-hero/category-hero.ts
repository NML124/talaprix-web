import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-category-hero',
  templateUrl: './category-hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryHero {}
