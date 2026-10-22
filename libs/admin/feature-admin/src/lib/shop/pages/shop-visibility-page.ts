import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Pagination } from '../../ui/pagination';
import { ShopStore } from '../shop-store';

@Component({
  selector: 'tp-shop-visibility-page',
  imports: [Pagination],
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  templateUrl: './shop-visibility-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopVisibilityPage {
  protected readonly store = inject(ShopStore);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly placements = computed(
    () => this.store.data()?.placements ?? [],
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.placements().length / this.pageSize)),
    ),
  );
  protected readonly visiblePlacements = computed(() =>
    this.placements().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
}
