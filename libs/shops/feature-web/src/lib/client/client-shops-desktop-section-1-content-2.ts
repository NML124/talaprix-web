import { ShopAvatar } from '@talaprix/shared/ui-kit';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ShopPreviewStore } from '@talaprix/shops/data-access';

@Component({
  selector: 'tpx-client-shops-desktop-section-1-content-2',
  imports: [RouterLink, SvgVisual, PriceTag, ShopAvatar],
  templateUrl: './client-shops-desktop-section-1-content-2.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientShopsDesktopSection1Content2 {
  readonly ui = inject(PreviewPreferences);
  readonly shops = inject(ShopPreviewStore);
  readonly zoomIn = (value: number) => Math.min(value + 0.1, 1.8);
  readonly zoomOut = (value: number) => Math.max(value - 0.1, 0.6);
}
