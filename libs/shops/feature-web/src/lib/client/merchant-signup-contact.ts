import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectCard } from '@talaprix/shared/ui-kit';
import { ShopPreviewStore } from '@talaprix/shops/data-access';
import { MerchantSignupState } from './merchant-signup-state';

@Component({
  selector: 'tpx-merchant-signup-contact',
  imports: [SelectCard],
  templateUrl: './merchant-signup-contact.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantSignupContact {
  readonly shops = inject(ShopPreviewStore);
  readonly state = inject(MerchantSignupState);
}
