import { SelectCard } from '@talaprix/shared/ui-kit';
import { ClientDetailDesktopSection3Actions5 } from './client-detail-desktop-section-3-actions-5';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-detail-desktop-section-3',
  imports: [
    SelectCard,
    ClientDetailDesktopSection3Actions5,
    PriceTag,
    RouterLink,
  ],
  templateUrl: './client-detail-desktop-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailDesktopSection3 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
