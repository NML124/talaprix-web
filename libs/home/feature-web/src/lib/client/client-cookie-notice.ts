import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AUDIENCE_ANALYTICS_TOKEN,
  CookieNoticeStore,
} from '@talaprix/home/data-access';

@Component({
  selector: 'lib-client-cookie-notice',
  imports: [RouterLink],
  templateUrl: './client-cookie-notice.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCookieNotice {
  readonly notice = inject(CookieNoticeStore);
  readonly #token = inject(AUDIENCE_ANALYTICS_TOKEN);

  constructor() {
    effect(() => {
      if (
        !this.notice.analytics() ||
        !this.notice.analyticsAvailable ||
        typeof document === 'undefined'
      )
        return;
      if (document.getElementById('talaprix-audience-beacon')) return;
      const script = document.createElement('script');
      script.id = 'talaprix-audience-beacon';
      script.type = 'module';
      script.defer = true;
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.setAttribute(
        'data-cf-beacon',
        JSON.stringify({ token: this.#token }),
      );
      document.body.appendChild(script);
    });
  }
}
