import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ShopSummary } from '@talaprix/shops/domain';
import { LucideMapPin, LucideStar, LucideStore } from '@lucide/angular';

@Component({
  selector: 'tpx-shop-card',
  imports: [LucideMapPin, LucideStar, LucideStore],
  templateUrl: './shop-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopCard {
  readonly shop = input.required<ShopSummary>();
}
