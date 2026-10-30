import { ClientDetailMobileSection3Card1 } from './client-detail-mobile-section-3-card-1';
import { ClientDetailMobileSection3Card2 } from './client-detail-mobile-section-3-card-2';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-detail-mobile-section-3-cards-3',
  imports: [
    ClientDetailMobileSection3Card1,
    ClientDetailMobileSection3Card2,
    RouterLink,
    PriceTag,
    ShopAvatar,
  ],
  templateUrl: './client-detail-mobile-section-3-cards-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailMobileSection3Cards3 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
