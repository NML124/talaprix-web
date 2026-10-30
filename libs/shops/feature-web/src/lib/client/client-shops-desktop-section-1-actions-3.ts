import { ClientShopsDesktopSection1Actions1 } from './client-shops-desktop-section-1-actions-1';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-desktop-section-1-actions-3',
  imports: [ClientShopsDesktopSection1Actions1, RouterLink],
  templateUrl: './client-shops-desktop-section-1-actions-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsDesktopSection1Actions3 {
  readonly ui = inject(PreviewPreferences);
  readonly shops = inject(ShopPreviewStore);
  readonly zoomIn = (value: number) => Math.min(value + 0.1, 1.8);
  readonly zoomOut = (value: number) => Math.max(value - 0.1, 0.6);
}
