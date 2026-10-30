import { ClientMerchantsDesktopSection1 } from './client-merchants-desktop-section-1';
import { ClientMerchantsDesktopContent } from './client-merchants-desktop-content';
import { ClientMerchantsMobileSection1 } from './client-merchants-mobile-section-1';
import { ClientMerchantsMobileSection2 } from './client-merchants-mobile-section-2';
import { ClientMerchantsMobileSection3 } from './client-merchants-mobile-section-3';
import { ClientMerchantsMobileSection4 } from './client-merchants-mobile-section-4';
import { ClientMerchantsMobileSection5 } from './client-merchants-mobile-section-5';
import { ClientMerchantsMobileSection6 } from './client-merchants-mobile-section-6';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tpx-client-merchants',
  imports: [
    ClientMerchantsDesktopSection1,
    ClientMerchantsDesktopContent,
    ClientMerchantsMobileSection1,
    ClientMerchantsMobileSection2,
    ClientMerchantsMobileSection3,
    ClientMerchantsMobileSection4,
    ClientMerchantsMobileSection5,
    ClientMerchantsMobileSection6,
  ],
  templateUrl: './client-merchants.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchants {}
