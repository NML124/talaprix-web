import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-optimized-mobile-section-3',
  imports: [PriceTag, SvgVisual, RouterLink],
  templateUrl: './client-cart-optimized-mobile-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimizedMobileSection3 {
  readonly ui = inject(PreviewPreferences);
  readonly cart = inject(CartPreviewStore);
}
