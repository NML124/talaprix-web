import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-home-desktop-section-7',
  imports: [],
  templateUrl: './client-home-desktop-section-7.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection7 {
  readonly ui = inject(PreviewPreferences);

  subscribe(event: Event): void {
    const form = (event.target as HTMLElement).closest('form');
    if (form?.reportValidity()) this.ui.newsletterSent.set(true);
  }
}
