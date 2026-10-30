import { ClientUnlocatedDesktopSection1Actions1 } from './client-unlocated-desktop-section-1-actions-1';
import { ClientUnlocatedDesktopSection1Actions2 } from './client-unlocated-desktop-section-1-actions-2';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-unlocated-desktop-section-1',
  imports: [
    ClientUnlocatedDesktopSection1Actions1,
    ClientUnlocatedDesktopSection1Actions2,
    ShopAvatar,
    RouterLink,
  ],
  templateUrl: './client-unlocated-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedDesktopSection1 {
  readonly ui = inject(PreviewPreferences);
}
