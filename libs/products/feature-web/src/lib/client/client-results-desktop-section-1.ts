import { SelectCard } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-results-desktop-section-1',
  imports: [SelectCard, SvgVisual, RouterLink],
  templateUrl: './client-results-desktop-section-1.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsDesktopSection1 {
  readonly catalog = inject(CatalogPreviewStore);
}
