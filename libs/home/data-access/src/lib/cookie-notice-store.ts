import { afterNextRender, Service, signal } from '@angular/core';

const NOTICE_KEY = 'talaprix.web.storage-notice.v1';

/** Remembers that the visitor read the essential-storage notice. */
@Service()
export class CookieNoticeStore {
  readonly visible = signal(false);

  constructor() {
    afterNextRender(() => {
      try {
        this.visible.set(localStorage.getItem(NOTICE_KEY) !== 'seen');
      } catch {
        this.visible.set(true);
      }
    });
  }

  open(): void {
    this.visible.set(true);
  }

  dismiss(): void {
    this.visible.set(false);
    try {
      localStorage.setItem(NOTICE_KEY, 'seen');
    } catch {
      // The notice may reappear when browser storage is disabled.
    }
  }
}
