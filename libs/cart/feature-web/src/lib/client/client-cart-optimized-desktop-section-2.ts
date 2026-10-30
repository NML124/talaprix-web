import { ClientCartGroup } from './client-cart-group';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-optimized-desktop-section-2',
  imports: [ClientCartGroup, PriceTag, SvgVisual, RouterLink],
  templateUrl: './client-cart-optimized-desktop-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimizedDesktopSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly cart = inject(CartPreviewStore);
}
