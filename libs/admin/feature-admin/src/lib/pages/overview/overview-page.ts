import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucidePlus } from '@lucide/angular';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { AdminMockApi } from '../../services/admin-mock-api';
import { fc, imagePath } from '../../mocks/catalogue';
import { Pagination } from '../../ui/pagination';
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

@Component({
  selector: 'tp-overview-page',
  imports: [
    RouterLink,
    PageHeader,
    SegmentedTabs,
    MetricBars,
    SavingsChart,
    Pagination,
    LucideChevronRight,
    LucidePlus,
  ],
  templateUrl: './overview-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  private readonly api = inject(AdminMockApi);
  protected readonly overview = signal<Awaited<
    ReturnType<AdminMockApi['getOverview']>
  > | null>(null);
  protected readonly activeTab = signal('Favoris');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly visibleTrending = computed(() =>
    (this.overview()?.trending ?? []).slice(
      (this.page() - 1) * this.pageSize,
      this.page() * this.pageSize,
    ),
  );
  protected readonly fc = fc;
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
  protected readonly cheapestShopBars = this.scaleBars(
    this.lowestPriceShops.map((row) => ({
      label: row.shop,
      detail: `Ex. ${row.example}`,
      value: row.wins,
      displayValue: String(row.wins),
      tone: 'positive' as const,
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
    {
      label: 'Favoris',
      field: 'favoritePeople' as const,
      tone: 'attention' as const,
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
