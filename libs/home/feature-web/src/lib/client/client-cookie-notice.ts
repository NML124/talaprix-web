import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieNoticeStore } from '@talaprix/home/data-access';

@Component({
  selector: 'lib-client-cookie-notice',
  imports: [RouterLink],
  templateUrl: './client-cookie-notice.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCookieNotice {
  readonly notice = inject(CookieNoticeStore);
}
