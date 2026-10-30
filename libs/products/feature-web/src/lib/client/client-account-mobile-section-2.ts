import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-account-mobile-section-2',
  imports: [],
  templateUrl: './client-account-mobile-section-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountMobileSection2 {
  readonly ui = inject(PreviewPreferences);
}
