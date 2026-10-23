import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMockApi } from '../../services/admin-mock-api';
import type { Product } from '../../mocks/models';
import { EmptyState } from '../../ui/empty-state';
import { PageHeader } from '../../ui/page-header';
import { Pagination } from '../../ui/pagination';
import { imagePath } from '../../mocks/catalogue';

@Component({
  selector: 'tp-admin-offers-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [DecimalPipe, FormsModule, EmptyState, PageHeader, Pagination],
  templateUrl: './offers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersPage {
  private readonly api = inject(AdminMockApi);
  protected readonly rows = signal<Product[]>([]);
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly imagePath = imagePath;
  protected readonly filtered = computed(() =>
    this.rows().filter((row) =>
      `${row.name} ${row.shop} ${row.category}`
        .toLocaleLowerCase('fr')
        .includes(this.query().toLocaleLowerCase('fr')),
    ),
  );
  protected readonly visible = computed(() =>
    this.filtered().slice(
      (this.page() - 1) * this.pageSize,
      this.page() * this.pageSize,
    ),
  );
  constructor() {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.rows.set(await this.api.listProducts());
  }
}
