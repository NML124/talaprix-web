import { ClientHomeDesktopSection2Card3 } from './client-home-desktop-section-2-card-3';
import { ClientHomeDesktopSection2Card1 } from './client-home-desktop-section-2-card-1';
import { ClientHomeDesktopSection2Card2 } from './client-home-desktop-section-2-card-2';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'lib-client-home-desktop-section-2',
  imports: [
    ClientHomeDesktopSection2Card3,
    ClientHomeDesktopSection2Card1,
    ClientHomeDesktopSection2Card2,
    ShopAvatar,
    PriceTag,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-home-desktop-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
