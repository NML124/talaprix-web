import { SelectCard } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-merchants-mobile-section-5',
  imports: [SelectCard],
  templateUrl: './client-merchants-mobile-section-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsMobileSection5 {
  readonly shops = inject(ShopPreviewStore);
}
