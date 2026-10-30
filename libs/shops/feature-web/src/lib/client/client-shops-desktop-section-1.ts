import { ClientShopsDesktopSection1Actions3 } from './client-shops-desktop-section-1-actions-3';
import { ClientShopsDesktopSection1Actions4 } from './client-shops-desktop-section-1-actions-4';
import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-desktop-section-1',
  imports: [
    ClientShopsDesktopSection1Actions3,
    ClientShopsDesktopSection1Actions4,
    ShopAvatar,
  ],
  templateUrl: './client-shops-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsDesktopSection1 {
  readonly ui = inject(PreviewPreferences);
  readonly shops = inject(ShopPreviewStore);
  readonly zoomIn = (value: number) => Math.min(value + 0.1, 1.8);
  readonly zoomOut = (value: number) => Math.max(value - 0.1, 0.6);
}
