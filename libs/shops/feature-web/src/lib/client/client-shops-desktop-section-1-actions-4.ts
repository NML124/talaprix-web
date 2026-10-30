import { ClientShopsDesktopSection1Content2 } from './client-shops-desktop-section-1-content-2';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-desktop-section-1-actions-4',
  imports: [ClientShopsDesktopSection1Content2, SvgVisual],
  templateUrl: './client-shops-desktop-section-1-actions-4.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsDesktopSection1Actions4 {
  readonly ui = inject(PreviewPreferences);
  readonly shops = inject(ShopPreviewStore);
  readonly zoomIn = (value: number) => Math.min(value + 0.1, 1.8);
  readonly zoomOut = (value: number) => Math.max(value - 0.1, 0.6);
}
