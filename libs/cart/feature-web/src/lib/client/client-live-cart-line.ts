import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LiveCartItem } from '@talaprix/cart/data-access';

@Component({
  selector: 'tpx-client-live-cart-line',
  imports: [RouterLink],
  templateUrl: './client-live-cart-line.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveCartLine {
  readonly item = input.required<LiveCartItem>();
  readonly quantityChange = output<number>();
  readonly remove = output<void>();
  readonly unitPrice = computed(() =>
    format(this.item().offer.price, this.item().offer.currency),
  );
  readonly linePrice = computed(() =>
    format(
      this.item().offer.price * this.item().quantity,
      this.item().offer.currency,
    ),
  );
}

function format(value: number, currency: 'USD' | 'CDF'): string {
  return `${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(value)} ${currency === 'CDF' ? 'FC' : 'USD'}`;
}
