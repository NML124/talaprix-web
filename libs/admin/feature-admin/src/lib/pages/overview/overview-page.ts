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

@Component({
  selector: 'tp-overview-page',
  imports: [
    RouterLink,
    PageHeader,
    SegmentedTabs,
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
  constructor() {
    void this.api.getOverview().then((value) => this.overview.set(value));
  }
  protected barHeight(value: number): string {
    return `${Math.round((value / 15) * 135)}px`;
  }
  protected barWidth(value: number): string {
    return `${Math.round((value / (this.activeTab() === 'Favoris' ? 428 : 2180)) * 100)}%`;
  }
}
