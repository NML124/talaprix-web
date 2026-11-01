import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MerchantFaq } from './merchant-faq';

@Component({
  selector: 'tpx-client-merchants-mobile-section-6',
  imports: [MerchantFaq],
  templateUrl: './client-merchants-mobile-section-6.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsMobileSection6 {}
