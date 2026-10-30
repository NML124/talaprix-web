import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-merchants-mobile-section-6',
  imports: [SvgVisual],
  templateUrl: './client-merchants-mobile-section-6.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsMobileSection6 {
  readonly ui = inject(PreviewPreferences);
}
