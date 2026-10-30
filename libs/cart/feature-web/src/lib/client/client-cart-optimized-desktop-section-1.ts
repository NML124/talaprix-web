import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartPreviewStore } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-cart-optimized-desktop-section-1',
  imports: [SvgVisual, RouterLink],
  templateUrl: './client-cart-optimized-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCartOptimizedDesktopSection1 {
  readonly cart = inject(CartPreviewStore);
}
