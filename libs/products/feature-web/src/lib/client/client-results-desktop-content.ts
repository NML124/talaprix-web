import { ClientResultsDesktopSection2 } from './client-results-desktop-section-2';
import { ClientResultsDesktopSection3 } from './client-results-desktop-section-3';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-results-desktop-content',
  imports: [ClientResultsDesktopSection2, ClientResultsDesktopSection3],
  templateUrl: './client-results-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientResultsDesktopContent {}
