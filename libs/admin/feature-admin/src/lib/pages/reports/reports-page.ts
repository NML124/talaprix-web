import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { savings, trending } from '../../mocks/overview';
import { imagePath } from '../../mocks/catalogue';
import { MetricBars } from '../../ui/metric-bars';
import type { MetricBarItem } from '../../ui/metric-bars';
import { SavingsChart } from '../../ui/savings-chart';

@Component({
  selector: 'tp-reports-page',
  imports: [PageHeader, SegmentedTabs, MetricBars, SavingsChart],
  templateUrl: './reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  protected readonly tab = signal('Mensuel');
  protected readonly view = computed(() =>
    this.tab() === 'Annuel'
      ? {
          period: 'Janvier–septembre 2026',
          primaryLabel: 'Économies estimées · cumul 2026',
          primaryValue: '76,4 M FC',
          primaryHint:
            'Janvier à septembre · estimation, sans ventes confirmées',
          secondaryLabel: 'Même période · 2025',
          secondaryValue: '58,2 M FC',
          secondaryHint: 'Base fictive de comparaison annuelle',
          chartLabel: 'Évolution mensuelle · 2026 vs 2025 · millions FC',
          growth: '+31,3 % sur un an',
          growthDetail: '76,4 M FC contre 58,2 M FC sur la même période',
        }
      : {
          period: 'Septembre 2026',
          primaryLabel: 'Économies estimées · septembre',
          primaryValue: '12,8 M FC',
          primaryHint: 'Écart de prix × produits consultés',
          secondaryLabel: 'Cumul estimé · 2026',
          secondaryValue: '76,4 M FC',
          secondaryHint: 'Janvier à septembre · pas de ventes confirmées',
          chartLabel: 'Évolution mensuelle · 2026 vs 2025 · millions FC',
          growth: '+18,5 % sur un mois',
          growthDetail: '12,8 M FC contre 10,8 M FC en août',
        },
  );
  protected readonly savings = savings;
  protected readonly trending = trending;
  protected readonly imagePath = imagePath;
  protected readonly reviewBars: MetricBarItem[] = [
    {
      label: 'Pain de mie',
      detail: '86 avis · Excellent',
      value: 4.8,
      width: 96,
      displayValue: '★ 4,8',
      tone: 'positive',
    },
    {
      label: "Chips Lay's",
      detail: '124 avis · Très bon',
      value: 4.6,
      width: 92,
      displayValue: '★ 4,6',
      tone: 'positive',
    },
    {
      label: 'Sac à main rouge',
      detail: '32 avis · À surveiller',
      value: 2.9,
      width: 58,
      displayValue: '★ 2,9',
      tone: 'attention',
    },
    {
      label: 'Pain complet',
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
