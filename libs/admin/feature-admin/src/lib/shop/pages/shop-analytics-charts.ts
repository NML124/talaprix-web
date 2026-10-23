import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { MetricBars } from '../../ui/metric-bars';
import type { MetricBarItem } from '../../ui/metric-bars';
import { ShopStore } from '../shop-store';

@Component({
  selector: 'tp-shop-analytics-charts',
  imports: [MetricBars],
  templateUrl: './shop-analytics-charts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopAnalyticsCharts {
  readonly periodKey = input.required<'7d' | '30d'>();
  private readonly store = inject(ShopStore);
  private readonly engagement = computed(
    () => this.store.data()?.engagement[this.periodKey()],
  );
  protected readonly engagementBars = computed<MetricBarItem[]>(() => {
    const data = this.engagement();
    return this.scale([
      { label: 'Consultations', value: data?.views ?? 0, tone: 'neutral' },
      {
        label: 'Contacts vendeur',
        value: data?.contactPeople ?? 0,
        tone: 'positive',
      },
      {
        label: 'Itinéraires ouverts',
        value: data?.locatePeople ?? 0,
        tone: 'attention',
      },
      {
        label: 'Ajouts en favoris',
        value: data?.favoritePeople ?? 0,
        tone: 'positive',
      },
    ]);
  });
  protected readonly priceBars = computed<MetricBarItem[]>(() => {
    const position = this.store.data()?.pricePosition;
    return this.scale([
      {
        label: 'Moins cher que le marché',
        value: position?.cheaper ?? 0,
        tone: 'positive',
      },
      {
        label: 'Dans la moyenne',
        value: position?.average ?? 0,
        tone: 'neutral',
      },
      {
        label: 'Plus cher que le marché',
        value: position?.higher ?? 0,
        tone: 'attention',
      },
      {
        label: 'À revoir',
        value: position?.overpriced ?? 0,
        tone: 'attention',
      },
    ]);
  });
  protected readonly competitorBars = computed<MetricBarItem[]>(() => {
    const rows = this.store.data()?.pricePosition?.competitors ?? [];
    return this.scale(
      rows.map((row) => ({
        label: row.name,
        value: row.cheaperProducts,
        tone: 'attention',
      })),
    );
  });

  private scale(items: Omit<MetricBarItem, 'width'>[]): MetricBarItem[] {
    const max = Math.max(1, ...items.map((item) => item.value));
    return items.map((item) => ({
      ...item,
      width: Math.round((item.value / max) * 100),
    }));
  }
}
