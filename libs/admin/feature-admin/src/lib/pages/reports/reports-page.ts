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

@Component({
  selector: 'tp-reports-page',
  imports: [PageHeader, SegmentedTabs],
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
  protected readonly currentPath = '0,108 110,96 220,83 330,66 440,47 550,31';
  protected readonly previousPath = '0,111 110,102 220,89 330,76 440,57 550,44';
}
