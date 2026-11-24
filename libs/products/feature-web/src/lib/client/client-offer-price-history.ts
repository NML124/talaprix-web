import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tpx-client-offer-price-history',
  templateUrl: './client-offer-price-history.html',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientOfferPriceHistory {
  readonly history = input.required<{
    low: string;
    high: string;
    position: number;
    path: string | null;
  }>();
}
