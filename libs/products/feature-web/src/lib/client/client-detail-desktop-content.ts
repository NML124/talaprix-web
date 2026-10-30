import { ClientDetailDesktopSection1 } from './client-detail-desktop-section-1';
import { ClientDetailDesktopSection2 } from './client-detail-desktop-section-2';
import { ClientDetailDesktopSection3 } from './client-detail-desktop-section-3';
import { ClientDetailDesktopSection4 } from './client-detail-desktop-section-4';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-detail-desktop-content',
  imports: [
    ClientDetailDesktopSection1,
    ClientDetailDesktopSection2,
    ClientDetailDesktopSection3,
    ClientDetailDesktopSection4,
  ],
  templateUrl: './client-detail-desktop-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailDesktopContent {}
