import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type {
  CatalogOffer,
  OfferInsight,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import {
  conditionLabel,
  directionsUrl,
  formatMoney,
  initial,
  productLink,
  splitSources,
  sourceLink,
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
  readonly #preferences = inject(PreviewPreferences);
  readonly offer = input.required<CatalogOffer>();
  readonly alternatives = input<readonly CatalogOffer[]>([]);
  readonly price = input.required<string>();
  readonly productName = input.required<string>();
  readonly best = input(false);
  readonly inCart = input(false);
  readonly quantity = input(0);
  readonly insight = input<OfferInsight | null>(null);
  readonly choose = output<void>();
  readonly chooseVariant = output<CatalogOffer>();
  readonly quantityChange = output<number>();
  readonly showOnMap = output<void>();
  readonly expanded = signal(false);

  readonly initial = computed(() => initial(this.offer().shopName));
  readonly condition = computed(() => conditionLabel(this.offer().condition));
  readonly observedOn = computed(() => {
    const value = this.offer().observedOn;
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.valueOf())) return null;
    return new Intl.DateTimeFormat('fr-CD', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(date);
  });
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
  readonly description = computed(() =>
    splitSources(this.insight()?.description ?? this.offer().description),
  );
  readonly comment = computed(() =>
    splitSources(this.insight()?.priceComment ?? null),
  );
  /** Prefer the offer's recorded source; retain legacy links in its notes. */
  readonly sources = computed(() => {
    const recorded = sourceLink(this.offer().sourceUrl);
    const all = [
      ...(recorded ? [recorded] : []),
      ...this.comment().links,
      ...this.description().links,
    ];
    return all.filter(
      (link, index) =>
        all.findIndex((other) => other.url === link.url) === index,
    );
  });
  /** Lowest / highest historical prices and where today's price sits. */
  readonly history = computed(() => {
    const insight = this.insight();
    const offer = this.offer();
    if (!insight) return null;
    const values = insight.history.map((point) => point.price);
    const low =
      insight.minHistoricalPrice ??
      (values.length ? Math.min(...values) : null);
    const high =
      insight.maxHistoricalPrice ??
      (values.length ? Math.max(...values) : null);
    if (low === null || high === null) return null;
    const position =
      high > low
        ? Math.min(1, Math.max(0, (offer.price - low) / (high - low)))
        : 0.5;
    const conversion =
      offer.price > 0 ? offer.normalizedPriceCdf / offer.price : null;
    const display = (value: number) =>
      conversion && Number.isFinite(conversion)
        ? this.#preferences.liveMoney(value, offer.currency, value * conversion)
        : formatMoney(value, offer.currency);
    return {
      low: display(low),
      high: display(high),
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
