import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-mobile-section-3-actions-1',
  imports: [ShopAvatar],
  templateUrl: './client-shops-mobile-section-3-actions-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsMobileSection3Actions1 {
  readonly shops = inject(ShopPreviewStore);
}
