import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { AdminDialog } from '../../ui/admin-dialog';
import { Pagination } from '../../ui/pagination';
import { imagePath } from '../../mocks/catalogue';
import { AdminCurrencyStore } from '../../services/admin-currency-store';
import { lowestPriceShops } from '../../mocks/overview-insights';
import { trending } from '../../mocks/overview';

type LowestPriceShop = ReturnType<typeof lowestPriceShops>[number];
type TrendingProduct = (typeof trending)[number];

@Component({
  selector: 'tp-overview-dialogs',
  imports: [AdminDialog, Pagination],
  templateUrl: './overview-dialogs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewDialogs {
  protected readonly currency = inject(AdminCurrencyStore);
  readonly lowestShop = input<LowestPriceShop | null>(null);
  readonly trendingOpen = input(false);
  readonly trendingRows = input<readonly TrendingProduct[]>([]);
  readonly activeTab = input('Favoris');
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly closeLowest = output<void>();
  readonly closeTrending = output<void>();
  readonly pageChanged = output<number>();
  protected readonly visibleTrending = computed(() =>
    this.trendingRows().slice(
      (this.page() - 1) * this.pageSize(),
      this.page() * this.pageSize(),
    ),
  );
  protected readonly imagePath = imagePath;
}
