import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'lib-client-home-desktop-section-1-content-1',
  imports: [RouterLink, SvgVisual],
  templateUrl: './client-home-desktop-section-1-content-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientHomeDesktopSection1Content1 {
  readonly ui = inject(PreviewPreferences);
}
