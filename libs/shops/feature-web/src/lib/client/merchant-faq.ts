import { ChangeDetectionStrategy, Component } from '@angular/core';
import { merchantFaq } from './merchant-faq-data';

@Component({
  selector: 'tpx-merchant-faq',
  templateUrl: './merchant-faq.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantFaq {
  readonly questions = merchantFaq;
}
