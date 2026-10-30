import { ClientAccountDesktopSection2Card1 } from './client-account-desktop-section-2-card-1';
import { ClientAccountDesktopSection2Card2 } from './client-account-desktop-section-2-card-2';
import { ClientAccountPanels } from './client-account-panels';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-account-desktop-section-2',
  imports: [
    ClientAccountDesktopSection2Card1,
    ClientAccountDesktopSection2Card2,
    ClientAccountPanels,
    PriceTag,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-account-desktop-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountDesktopSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
