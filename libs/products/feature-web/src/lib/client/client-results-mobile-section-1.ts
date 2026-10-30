import { SelectCard } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-results-mobile-section-1',
  imports: [SelectCard, SvgVisual],
  templateUrl: './client-results-mobile-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsMobileSection1 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
