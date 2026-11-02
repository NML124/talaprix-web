import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';
import { AuthPreviewStore } from '@talaprix/users/data-access';
import { ClientAuthBrandPanel } from './client-auth-brand-panel';

@Component({
  selector: 'lib-client-auth-desktop-code',
  imports: [ClientAuthBrandPanel, SvgVisual],
  templateUrl: './client-auth-desktop-code.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAuthDesktopCode {
  readonly ui = inject(PreviewPreferences);
  readonly auth = inject(AuthPreviewStore);
}
