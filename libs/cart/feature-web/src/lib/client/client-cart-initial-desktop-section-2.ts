import { ClientCartGroup } from './client-cart-group';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-initial-desktop-section-2',
  imports: [ClientCartGroup, PriceTag, SvgVisual],
  templateUrl: './client-cart-initial-desktop-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitialDesktopSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly cart = inject(CartPreviewStore);
}
