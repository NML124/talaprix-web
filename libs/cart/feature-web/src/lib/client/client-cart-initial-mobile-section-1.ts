import { CartPreviewStore } from '@talaprix/cart/data-access';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-client-cart-initial-mobile-section-1',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-cart-initial-mobile-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitialMobileSection1 {
  readonly cart = inject(CartPreviewStore);
}
