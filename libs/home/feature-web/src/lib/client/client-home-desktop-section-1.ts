import { ClientHomeDesktopSection1Content1 } from './client-home-desktop-section-1-content-1';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-home-desktop-section-1',
  imports: [ClientHomeDesktopSection1Content1, SvgVisual, RouterLink],
  templateUrl: './client-home-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection1 {
  readonly ui = inject(PreviewPreferences);
}
