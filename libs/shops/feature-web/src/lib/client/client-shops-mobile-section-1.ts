import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-mobile-section-1',
  imports: [],
  templateUrl: './client-shops-mobile-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsMobileSection1 {
  readonly shops = inject(ShopPreviewStore);
}
