import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-mobile-section-2',
  imports: [ShopAvatar, SvgVisual],
  templateUrl: './client-shops-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsMobileSection2 {
  readonly shops = inject(ShopPreviewStore);
}
