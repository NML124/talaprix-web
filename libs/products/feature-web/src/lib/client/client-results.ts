import { ClientResultsDesktopSection1 } from './client-results-desktop-section-1';
import { ClientResultsDesktopContent } from './client-results-desktop-content';
import { ClientResultsMobileSection1 } from './client-results-mobile-section-1';
import { ClientResultsMobileContent } from './client-results-mobile-content';
import { ClientResultsMobileSection4 } from './client-results-mobile-section-4';
import { ClientFilters } from './client-filters';
import { CatalogPreviewStore } from '@talaprix/products/data-access';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
  selector: 'tpx-client-results',
  imports: [
    ClientResultsDesktopSection1,
    ClientResultsDesktopContent,
    ClientResultsMobileSection1,
    ClientResultsMobileContent,
    ClientResultsMobileSection4,
    ClientFilters,
  ],
  templateUrl: './client-results.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResults {
  readonly catalog = inject(CatalogPreviewStore);
}
