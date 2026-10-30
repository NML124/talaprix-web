import { ClientAccountMobileSection1 } from './client-account-mobile-section-1';
import { ClientAccountMobileSection2 } from './client-account-mobile-section-2';
import { ClientAccountMobileSection3 } from './client-account-mobile-section-3';
import { ClientAccountMobileSection4 } from './client-account-mobile-section-4';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-account-mobile-content',
  imports: [
    ClientAccountMobileSection1,
    ClientAccountMobileSection2,
    ClientAccountMobileSection3,
    ClientAccountMobileSection4,
  ],
  templateUrl: './client-account-mobile-content.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountMobileContent {}
