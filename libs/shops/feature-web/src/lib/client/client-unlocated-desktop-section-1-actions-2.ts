import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-unlocated-desktop-section-1-actions-2',
  imports: [SvgVisual, ShopAvatar],
  templateUrl: './client-unlocated-desktop-section-1-actions-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedDesktopSection1Actions2 {
  readonly ui = inject(PreviewPreferences);
}
