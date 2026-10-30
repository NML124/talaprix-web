import { ClientUnlocatedMobileSection2 } from './client-unlocated-mobile-section-2';
import { ClientUnlocatedMobileSection3 } from './client-unlocated-mobile-section-3';
import { ClientUnlocatedMobileSection4 } from './client-unlocated-mobile-section-4';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-unlocated-mobile-content',
  imports: [
    ClientUnlocatedMobileSection2,
    ClientUnlocatedMobileSection3,
    ClientUnlocatedMobileSection4,
  ],
  templateUrl: './client-unlocated-mobile-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientUnlocatedMobileContent {}
