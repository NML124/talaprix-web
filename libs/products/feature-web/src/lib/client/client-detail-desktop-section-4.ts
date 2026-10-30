import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Component({
  selector: 'tpx-client-detail-desktop-section-4',
  imports: [PriceTag, SvgVisual, RouterLink],
  templateUrl: './client-detail-desktop-section-4.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailDesktopSection4 {
  readonly ui = inject(PreviewPreferences);
}
