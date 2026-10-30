import { ClientCartGroup } from './client-cart-group';
import { CartPreviewStore } from '@talaprix/cart/data-access';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-cart-initial-mobile-section-2',
  imports: [ClientCartGroup],
  templateUrl: './client-cart-initial-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitialMobileSection2 {
  readonly cart = inject(CartPreviewStore);
  readonly ui = inject(PreviewPreferences);
}
