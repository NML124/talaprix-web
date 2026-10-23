import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminDialog } from '../../ui/admin-dialog';
import { Pagination } from '../../ui/pagination';
import { ShopAnalyticsCharts } from './shop-analytics-charts';
import { ShopStore } from '../shop-store';

@Component({
  selector: 'tp-shop-analytics-page',
  imports: [FormsModule, AdminDialog, Pagination, ShopAnalyticsCharts],
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-analytics-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopAnalyticsPage {
  protected readonly store = inject(ShopStore);
  protected readonly period = signal<'7 jours' | '30 jours'>('30 jours');
  protected readonly detailOpen = signal(false);
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly periodKey = computed(() =>
    this.period() === '7 jours' ? '7d' : '30d',
  );
  protected readonly engagement = computed(
    () => this.store.data()?.engagement[this.periodKey()],
  );
  protected readonly featured = computed(() =>
    [...(this.store.data()?.offers ?? [])].sort(
      (left, right) =>
        right.engagement[this.periodKey()].views -
        left.engagement[this.periodKey()].views,
    ),
  );
  protected readonly preview = computed(() => this.featured().slice(0, 5));
  protected readonly filteredOffers = computed(() =>
    this.featured().filter((offer) =>
      offer.product
        .toLocaleLowerCase('fr')
        .includes(this.query().trim().toLocaleLowerCase('fr')),
    ),
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.filteredOffers().length / this.pageSize)),
    ),
  );
  protected readonly visibleOffers = computed(() =>
    this.filteredOffers().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
}
