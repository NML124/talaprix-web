import { ClientResultsMobileSection2 } from './client-results-mobile-section-2';
import { ClientResultsMobileSection3 } from './client-results-mobile-section-3';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-results-mobile-content',
  imports: [ClientResultsMobileSection2, ClientResultsMobileSection3],
  templateUrl: './client-results-mobile-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsMobileContent {}
