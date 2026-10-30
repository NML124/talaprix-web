import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-initial-desktop-section-1',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-cart-initial-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartInitialDesktopSection1 {
  readonly cart = inject(CartPreviewStore);
}
