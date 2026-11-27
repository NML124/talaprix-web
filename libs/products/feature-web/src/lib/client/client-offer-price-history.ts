import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import type { PriceHistoryChart } from './price-history-chart';

@Component({
  selector: 'tpx-client-offer-price-history',
  templateUrl: './client-offer-price-history.html',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientOfferPriceHistory {
  readonly history = input.required<PriceHistoryChart>();
  readonly selected = signal<number | null>(null);
  readonly point = computed(() => {
    const points = this.history().points;
    return (
      points[this.selected() ?? points.findIndex((p) => p.current)] ??
      points[points.length - 1]
    );
  });
}
