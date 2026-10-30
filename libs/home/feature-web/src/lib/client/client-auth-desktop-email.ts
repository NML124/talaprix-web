import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';
import { AuthPreviewStore } from '@talaprix/users/data-access';

@Component({
  selector: 'lib-client-auth-desktop-email',
  imports: [ShopAvatar, SvgVisual],
  templateUrl: './client-auth-desktop-email.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAuthDesktopEmail {
  readonly ui = inject(PreviewPreferences);
  readonly auth = inject(AuthPreviewStore);
}
