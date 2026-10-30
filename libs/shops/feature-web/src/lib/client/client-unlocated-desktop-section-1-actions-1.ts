import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-unlocated-desktop-section-1-actions-1',
  imports: [RouterLink, SvgVisual],
  templateUrl: './client-unlocated-desktop-section-1-actions-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedDesktopSection1Actions1 {
  readonly ui = inject(PreviewPreferences);
}
