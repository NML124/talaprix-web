import { ClientDetailMobileSection3Cards3 } from './client-detail-mobile-section-3-cards-3';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-detail-mobile-section-3',
  imports: [ClientDetailMobileSection3Cards3, SvgVisual],
  templateUrl: './client-detail-mobile-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailMobileSection3 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
