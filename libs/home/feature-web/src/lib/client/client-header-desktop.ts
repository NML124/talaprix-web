import { ClientHeaderDesktopControls1 } from './client-header-desktop-controls-1';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-header-desktop',
  imports: [ClientHeaderDesktopControls1, RouterLink],
  templateUrl: './client-header-desktop.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHeaderDesktop {
  readonly ui = inject(PreviewPreferences);
}
