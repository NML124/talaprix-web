import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-account-desktop-section-1',
  imports: [],
  templateUrl: './client-account-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountDesktopSection1 {
  readonly ui = inject(PreviewPreferences);
}
