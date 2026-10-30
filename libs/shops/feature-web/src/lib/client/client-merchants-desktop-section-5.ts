import { SelectCard } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-merchants-desktop-section-5',
  imports: [SelectCard, SvgVisual],
  templateUrl: './client-merchants-desktop-section-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsDesktopSection5 {
  readonly shops = inject(ShopPreviewStore);
}
