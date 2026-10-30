import { ClientCartGroup } from './client-cart-group';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-optimized-mobile-section-2',
  imports: [ClientCartGroup, SvgVisual],
  templateUrl: './client-cart-optimized-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimizedMobileSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly cart = inject(CartPreviewStore);
}
