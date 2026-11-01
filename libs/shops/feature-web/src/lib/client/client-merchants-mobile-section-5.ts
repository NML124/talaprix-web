import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MerchantSignupForm } from './merchant-signup-form';

@Component({
  selector: 'tpx-client-merchants-mobile-section-5',
  imports: [MerchantSignupForm],
  templateUrl: './client-merchants-mobile-section-5.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientMerchantsMobileSection5 {}
