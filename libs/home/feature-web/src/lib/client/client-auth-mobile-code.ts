import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { AuthPreviewStore } from '@talaprix/users/data-access';

@Component({
  selector: 'lib-client-auth-mobile-code',
  imports: [ShopAvatar, SvgVisual, RouterLink],
  templateUrl: './client-auth-mobile-code.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAuthMobileCode {
  readonly ui = inject(PreviewPreferences);
  readonly auth = inject(AuthPreviewStore);
}
