import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { trending } from '../../mocks/overview';
import {
  savingsByPeriod,
  savingsPeriodNote,
  savingsPeriods,
  type SavingsPeriod,
} from '../../mocks/savings-periods';
import { imagePath } from '../../mocks/catalogue';
import { MetricBars } from '../../ui/metric-bars';
import type { MetricBarItem } from '../../ui/metric-bars';
import { SavingsChart } from '../../ui/savings-chart';
import { AdminCurrencyStore } from '../../services/admin-currency-store';

@Component({
  selector: 'tp-reports-page',
  imports: [PageHeader, SegmentedTabs, MetricBars, SavingsChart],
  templateUrl: './reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  protected readonly currency = inject(AdminCurrencyStore);
  protected readonly tab = signal<SavingsPeriod>('Mois');
  protected readonly periods = savingsPeriods;
  protected selectPeriod(value: string): void {
    if (savingsPeriods.includes(value as SavingsPeriod))
      this.tab.set(value as SavingsPeriod);
  }
  protected readonly view = computed(() => {
    const period = this.tab();
    const latest = savingsByPeriod[period][savingsByPeriod[period].length - 1];
    const current = latest?.current ?? 0;
    const previous = latest?.previous ?? 0;
    const percent = previous
      ? Math.round(((current - previous) / previous) * 100)
      : 0;
    const format = (value: number) =>
      this.currency.formatMillionsFromCdf(value);
    return {
      period: savingsPeriodNote[period],
      primaryLabel:
        period === 'Année'
          ? 'Économies estimées · janvier à septembre 2026'
          : `Économies estimées · ${period.toLowerCase()}`,
      primaryValue: format(current),
      primaryHint: 'Estimation, sans vente confirmée',
      secondaryLabel:
        period === 'Année' ? 'Janvier à septembre 2025' : 'Période précédente',
      secondaryValue: format(previous),
      secondaryHint: 'À périmètre comparable',
      chartLabel: savingsPeriodNote[period],
      growth: `${percent >= 0 ? '+' : ''}${percent} %`,
      growthDetail: `${format(current)} contre ${format(previous)} pour la période précédente`,
    };
  });
  protected readonly savings = computed(() => savingsByPeriod[this.tab()]);
  protected readonly trending = trending;
  protected readonly imagePath = imagePath;
  protected readonly reviewBars: MetricBarItem[] = [
    {
      label: 'Kin Marché',
      detail: '86 avis · Excellent',
      value: 4.8,
      width: 96,
      displayValue: '★ 4,8',
      tone: 'positive',
    },
    {
      label: 'S&K',
      detail: '124 avis · Très bon',
      value: 4.6,
      width: 92,
      displayValue: '★ 4,6',
      tone: 'positive',
    },
    {
      label: 'Maison Galaxy',
      detail: '32 avis · À surveiller',
      value: 2.9,
      width: 58,
      displayValue: '★ 2,9',
      tone: 'attention',
    },
    {
      label: 'Swiss Mart',
      detail: '28 avis · À surveiller',
      value: 3.1,
      width: 62,
      displayValue: '★ 3,1',
      tone: 'attention',
    },
  ];
  protected readonly favoriteBars: MetricBarItem[] = trending.map((row) => {
    const growth =
      {
        'Pain de mie': '22,1',
        "Chips Lay's": '18,3',
        'Baskets Adidas': '15,7',
        'Nike Air Force 1': '11,6',
      }[row.name] ?? '0';
    return {
      label: row.name,
      detail: `+${growth} % sur la période`,
      value: row.favorites,
      width: Math.round((row.favorites / 428) * 100),
      displayValue: `${row.favorites} favoris`,
      tone: 'positive',
      image: imagePath(row.image),
    };
  });
}
