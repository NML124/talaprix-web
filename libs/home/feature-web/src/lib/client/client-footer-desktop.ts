import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ClientSocialLinks } from './client-social-links';
import { CookieNoticeStore } from '@talaprix/home/data-access';

@Component({
  selector: 'lib-client-footer-desktop',
  imports: [ShopAvatar, RouterLink, ClientSocialLinks],
  templateUrl: './client-footer-desktop.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientFooterDesktop {
  readonly ui = inject(PreviewPreferences);
  readonly cookieNotice = inject(CookieNoticeStore);
}
