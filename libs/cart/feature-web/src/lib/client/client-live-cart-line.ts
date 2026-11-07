import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LiveCartItem } from '@talaprix/cart/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { productImageUrl } from '@talaprix/shared/utils';

@Component({
  selector: 'tpx-client-live-cart-line',
  imports: [RouterLink],
  templateUrl: './client-live-cart-line.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveCartLine {
  readonly imageUrl = productImageUrl;
  readonly #preferences = inject(PreviewPreferences);
  readonly item = input.required<LiveCartItem>();
  readonly quantityChange = output<number>();
  readonly remove = output<void>();
  readonly unitPrice = computed(() => {
    const offer = this.item().offer;
    if (!offer) return 'Prix à confirmer';
    return this.#preferences.liveMoney(
      offer.price,
      offer.currency,
      offer.normalizedPriceCdf,
    );
  });
  readonly linePrice = computed(() => {
    const { offer, quantity } = this.item();
    return offer
      ? this.#preferences.liveMoney(
          offer.price * quantity,
          offer.currency,
          offer.normalizedPriceCdf * quantity,
        )
      : 'Prix à confirmer';
  });
}
