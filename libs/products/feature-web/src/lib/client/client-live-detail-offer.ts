import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  CatalogOffer,
  OfferInsight,
} from '@talaprix/products/data-access';
import {
  conditionLabel,
  directionsUrl,
  formatMoney,
  initial,
  productLink,
  whatsappPhone,
  whatsappUrl,
} from './client-live-detail-format';

@Component({
  selector: 'tpx-client-live-detail-offer',
  templateUrl: './client-live-detail-offer.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailOffer {
  readonly offer = input.required<CatalogOffer>();
  readonly price = input.required<string>();
  readonly productName = input.required<string>();
  readonly best = input(false);
  readonly inCart = input(false);
  readonly insight = input<OfferInsight | null>(null);
  readonly choose = output<void>();
  readonly showOnMap = output<void>();
  readonly expanded = signal(false);

  readonly initial = computed(() => initial(this.offer().shopName));
  readonly condition = computed(() => conditionLabel(this.offer().condition));
  readonly directions = computed(() =>
    directionsUrl(
      this.offer().shopLat,
      this.offer().shopLon,
      this.offer().shopAddress,
    ),
  );
  readonly hasMap = computed(
    () => this.offer().shopLat !== null && this.offer().shopLon !== null,
  );
  readonly whatsapp = computed(() => {
    const phone = whatsappPhone(this.insight()?.phone ?? null);
    return phone
      ? whatsappUrl(
          phone,
          this.offer().shopName,
          this.productName(),
          productLink(this.offer().referenceId),
        )
      : null;
  });
  readonly description = computed(
    () => this.insight()?.description ?? this.offer().description,
  );
  /** Lowest / highest historical prices and where today's price sits. */
  readonly history = computed(() => {
    const insight = this.insight();
    const offer = this.offer();
    if (!insight) return null;
    const values = insight.history.map((point) => point.price);
    const low = insight.minHistoricalPrice ?? (values.length ? Math.min(...values) : null);
    const high = insight.maxHistoricalPrice ?? (values.length ? Math.max(...values) : null);
    if (low === null || high === null) return null;
    const position =
      high > low ? Math.min(1, Math.max(0, (offer.price - low) / (high - low))) : 0.5;
    return {
      low: formatMoney(low, offer.currency),
      high: formatMoney(high, offer.currency),
      position: Math.round(position * 100),
      path: sparkline(values),
    };
  });
}

/** SVG path (viewBox 0 0 100 32) for a small price curve, or null. */
function sparkline(values: readonly number[]): string | null {
  if (values.length < 2) return null;
  const low = Math.min(...values);
  const span = Math.max(...values) - low || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - low) / span) * 24;
      return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
