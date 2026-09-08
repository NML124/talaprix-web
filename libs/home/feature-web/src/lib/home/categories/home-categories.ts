import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';

@Component({
  selector: 'lib-home-categories',
  imports: [LucideChevronRight],
  templateUrl: './home-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCategories {
  protected readonly categories = [
    'Téléphones & tablettes',
    'Maison & électroménager',
    'Informatique',
    'Mode & beauté',
  ];
}
