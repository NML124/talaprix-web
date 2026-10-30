import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-footer-mobile',
  imports: [ShopAvatar, SvgVisual],
  templateUrl: './client-footer-mobile.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFooterMobile {
  readonly ui = inject(PreviewPreferences);
}
