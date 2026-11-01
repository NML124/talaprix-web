import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MerchantFaq } from './merchant-faq';

@Component({
  selector: 'tpx-client-merchants-desktop-section-6',
  imports: [MerchantFaq],
  templateUrl: './client-merchants-desktop-section-6.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsDesktopSection6 {}
