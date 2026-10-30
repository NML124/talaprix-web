import { ClientResultsDesktopSection3Card1 } from './client-results-desktop-section-3-card-1';
import { ClientResultsDesktopSection3Card2 } from './client-results-desktop-section-3-card-2';
import { ClientResultsDesktopSection3Card3 } from './client-results-desktop-section-3-card-3';
import { ClientResultsDesktopSection3Card4 } from './client-results-desktop-section-3-card-4';
import { ClientResultsDesktopSection3Card5 } from './client-results-desktop-section-3-card-5';
import { PriceTag } from '@talaprix/shared/ui-kit';
import { SvgVisual } from '@talaprix/shared/ui-kit';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { CatalogPreviewStore } from '@talaprix/products/data-access';

@Component({
  selector: 'tpx-client-results-desktop-section-3',
  imports: [
    ClientResultsDesktopSection3Card1,
    ClientResultsDesktopSection3Card2,
    ClientResultsDesktopSection3Card3,
    ClientResultsDesktopSection3Card4,
    ClientResultsDesktopSection3Card5,
    PriceTag,
    SvgVisual,
    RouterLink,
  ],
  templateUrl: './client-results-desktop-section-3.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsDesktopSection3 {
  readonly ui = inject(PreviewPreferences);
  readonly catalog = inject(CatalogPreviewStore);
}
