import { ClientShopsMobileSection3Actions1 } from './client-shops-mobile-section-3-actions-1';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-mobile-section-3',
  imports: [
    ClientShopsMobileSection3Actions1,
    ShopAvatar,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-shops-mobile-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsMobileSection3 {
  readonly shops = inject(ShopPreviewStore);
}
