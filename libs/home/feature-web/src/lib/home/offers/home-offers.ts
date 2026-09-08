import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideArrowRight, LucideHeart, LucideStar } from '@lucide/angular';

@Component({
  selector: 'lib-home-offers',
  imports: [LucideArrowRight, LucideHeart, LucideStar],
  templateUrl: './home-offers.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeOffers {
  protected readonly products = [
    'Apple iPhone 15 128 Go',
    'Casque Sony WH-1000XM5',
    'Machine à café automatique',
    'Nike Air Max 270',
  ];
}
