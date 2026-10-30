import { ClientDetailDesktopSection3Actions1 } from './client-detail-desktop-section-3-actions-1';
import { ClientDetailDesktopSection3Actions2 } from './client-detail-desktop-section-3-actions-2';
import { ClientDetailDesktopSection3Actions3 } from './client-detail-desktop-section-3-actions-3';
import { ClientDetailDesktopSection3Actions4 } from './client-detail-desktop-section-3-actions-4';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-detail-desktop-section-3-actions-5',
  imports: [
    ClientDetailDesktopSection3Actions1,
    ClientDetailDesktopSection3Actions2,
    ClientDetailDesktopSection3Actions3,
    ClientDetailDesktopSection3Actions4,
    RouterLink,
    SvgVisual,
    PriceTag,
    ShopAvatar,
  ],
  templateUrl: './client-detail-desktop-section-3-actions-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailDesktopSection3Actions5 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
