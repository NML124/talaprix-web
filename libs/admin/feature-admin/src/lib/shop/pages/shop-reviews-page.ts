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
  selector: 'tp-shop-reviews-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [Pagination],
  templateUrl: './shop-reviews-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopReviewsPage {
  protected readonly store = inject(ShopStore);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly reviews = computed(() => this.store.data()?.reviews ?? []);
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.reviews().length / this.pageSize)),
    ),
  );
  protected readonly visibleReviews = computed(() =>
    this.reviews().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
}
