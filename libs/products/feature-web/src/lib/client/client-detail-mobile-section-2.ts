import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-detail-mobile-section-2',
  imports: [PriceTag, SvgVisual],
  templateUrl: './client-detail-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailMobileSection2 {
  readonly ui = inject(PreviewPreferences);
}
