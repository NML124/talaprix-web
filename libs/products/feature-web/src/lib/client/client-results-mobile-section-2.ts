import { ClientResultsMobileSection2Content1 } from './client-results-mobile-section-2-content-1';
import { ClientResultsMobileSection2Content2 } from './client-results-mobile-section-2-content-2';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-results-mobile-section-2',
  imports: [
    ClientResultsMobileSection2Content1,
    ClientResultsMobileSection2Content2,
    ShopAvatar,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-results-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsMobileSection2 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
