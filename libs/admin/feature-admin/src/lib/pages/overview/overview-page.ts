import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowUpRight,
  LucideChevronRight,
  LucidePlus,
} from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { AdminMockApi } from '../../services/admin-mock-api';
import { imagePath } from '../../mocks/catalogue';
import { OverviewDialogs } from './overview-dialogs';
import { adminEngagementPreview } from '../../mocks/admin-engagement-preview';
import { MetricBars } from '../../ui/metric-bars';
import type { MetricBarItem } from '../../ui/metric-bars';
import { SavingsChart } from '../../ui/savings-chart';
import {
  comparableProductCount,
  lowestPriceShops,
  usageZones,
} from '../../mocks/overview-insights';
import type { AuditEntry } from '../../mocks/models';
import { AdminCurrencyStore } from '../../services/admin-currency-store';
import {
  savingsByPeriod,
  savingsPeriodNote,
  savingsPeriods,
  type SavingsPeriod,
} from '../../mocks/savings-periods';

@Component({
  selector: 'tp-overview-page',
  imports: [
    RouterLink,
    PageHeader,
    SegmentedTabs,
    MetricBars,
    SavingsChart,
    OverviewDialogs,
    LucideArrowUpRight,
    LucideChevronRight,
    LucidePlus,
  ],
  templateUrl: './overview-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  private readonly api = inject(AdminMockApi);
  protected readonly currency = inject(AdminCurrencyStore);
  protected readonly overview = signal<Awaited<
    ReturnType<AdminMockApi['getOverview']>
  > | null>(null);
  protected readonly activeTab = signal('Favoris');
  protected readonly visibleTrending = computed(() =>
    (this.overview()?.trending ?? []).slice(0, 3),
  );
  protected readonly trendingOpen = signal(false);
  protected readonly trendingPage = signal(1);
  protected readonly trendingPageSize = 10;
  protected readonly selectedLowest = signal<
    (typeof this.lowestPriceShops)[number] | null
  >(null);
  protected readonly savingsPeriod = signal<SavingsPeriod>('Mois');
  protected readonly savingsPeriods = savingsPeriods;
  protected readonly savingsSeries = computed(
    () => savingsByPeriod[this.savingsPeriod()],
  );
  protected readonly savingsNote = computed(
    () => savingsPeriodNote[this.savingsPeriod()],
  );
  protected readonly savingsCurrent = computed(
    () => this.savingsSeries()[this.savingsSeries().length - 1],
  );
  protected readonly savingsTotal = computed(() =>
    this.currency.formatMillionsFromCdf(this.savingsCurrent()?.current ?? 0),
  );
  protected readonly savingsChange = computed(() => {
    const row = this.savingsCurrent();
    if (!row?.previous) return '';
    const change = Math.round(
      ((row.current - row.previous) / row.previous) * 100,
    );
    return `${change >= 0 ? '+' : ''}${change} % vs période précédente`;
  });
  protected readonly imagePath = imagePath;
  protected readonly engagement = adminEngagementPreview;
  protected readonly usageZones = usageZones;
  protected readonly lowestPriceShops = lowestPriceShops();
  protected readonly zoneBars = this.scaleBars(
    usageZones.map((row) => ({
      label: row.zone,
      value: row.users,
      displayValue: row.users.toLocaleString('fr-FR'),
      tone: 'neutral' as const,
    })),
  );
  protected readonly engagementBars = [
    {
      label: 'Contacts',
      field: 'contactPeople' as const,
      tone: 'positive' as const,
    },
    {
      label: 'Itinéraires',
      field: 'locatePeople' as const,
      tone: 'neutral' as const,
    },
  ].map((chart) => ({
    ...chart,
    items: this.scaleBars(
      this.engagement.shops.map((shop) => ({
        label: shop.name,
        value: shop[chart.field],
        displayValue: shop[chart.field].toLocaleString('fr-FR'),
        tone: chart.tone,
      })),
    ),
  }));
  protected readonly comparableProductCount = comparableProductCount;
  protected readonly audit = signal<AuditEntry[]>([]);
  constructor() {
    void this.api.getOverview().then((value) => this.overview.set(value));
    void this.api.listAudit().then((value) => this.audit.set(value));
  }
  private scaleBars(items: Omit<MetricBarItem, 'width'>[]): MetricBarItem[] {
    const max = Math.max(1, ...items.map((item) => item.value));
    return items.map((item) => ({
      ...item,
      width: Math.round((item.value / max) * 100),
    }));
  }
  protected barWidth(value: number): string {
    return `${Math.round((value / (this.activeTab() === 'Favoris' ? 428 : 2180)) * 100)}%`;
  }
}
