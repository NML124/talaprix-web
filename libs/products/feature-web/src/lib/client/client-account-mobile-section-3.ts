import { ClientAccountMobileSection3Card1 } from './client-account-mobile-section-3-card-1';
import { ClientAccountPanels } from './client-account-panels';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-account-mobile-section-3',
  imports: [
    ClientAccountMobileSection3Card1,
    ClientAccountPanels,
    PriceTag,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-account-mobile-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountMobileSection3 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
