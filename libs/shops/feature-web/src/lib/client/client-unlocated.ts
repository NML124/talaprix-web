import { ClientUnlocatedDesktopSection1 } from './client-unlocated-desktop-section-1';
import { ClientUnlocatedMobileSection1 } from './client-unlocated-mobile-section-1';
import { ClientUnlocatedMobileContent } from './client-unlocated-mobile-content';
import { ClientUnlocatedMobileSection5 } from './client-unlocated-mobile-section-5';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-unlocated',
  imports: [
    ClientUnlocatedDesktopSection1,
    ClientUnlocatedMobileSection1,
    ClientUnlocatedMobileContent,
    ClientUnlocatedMobileSection5,
  ],
  templateUrl: './client-unlocated.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocated {}
