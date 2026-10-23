import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { AdminMockApi } from '../../services/admin-mock-api';
import type { Advertisement } from '../../mocks/advertisements';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';
import { EmptyState } from '../../ui/empty-state';
import { PageHeader } from '../../ui/page-header';
import { Pagination } from '../../ui/pagination';
import { SingleImagePicker } from '../../ui/single-image-picker';
import { AdminDatePicker } from '../../ui/admin-date-picker';

@Component({
  selector: 'tp-advertisements-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [
    FormsModule,
    LucidePause,
    LucidePencil,
    LucidePlay,
    LucidePlus,
    LucideTrash2,
    AdminDialog,
    AdminSelect,
    EmptyState,
    PageHeader,
    Pagination,
    SingleImagePicker,
    AdminDatePicker,
  ],
  templateUrl: './advertisements-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvertisementsPage {
  private readonly api = inject(AdminMockApi);
  protected readonly rows = signal<Advertisement[]>([]);
  protected readonly shops = signal<string[]>([]);
  protected readonly query = signal('');
  protected readonly draft = signal<Advertisement | null>(null);
  protected readonly mode = signal<'edit' | 'delete'>('edit');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly filtered = computed(() =>
    this.rows().filter((row) =>
      `${row.name} ${row.shop}`
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
    this.loading.set(true);
    try {
      const [rows, shops] = await Promise.all([
        this.api.listAdvertisements(),
        this.api.listShops(),
      ]);
      this.rows.set(rows);
      this.shops.set(shops.map((row) => row.name));
      this.error.set('');
    } catch {
      this.error.set('Les publicités ne peuvent pas être chargées.');
    } finally {
      this.loading.set(false);
    }
  }
  protected create(): void {
    this.mode.set('edit');
    this.draft.set({
      id: Date.now(),
      name: '',
      shop: this.shops()[0] ?? '',
      image: 'maison-galaxy.png',
      status: 'Active',
      priority: 1,
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
  }
  protected edit(row: Advertisement): void {
    this.mode.set('edit');
    this.draft.set(structuredClone(row));
  }
  protected remove(row: Advertisement): void {
    this.mode.set('delete');
    this.draft.set(row);
  }
  protected change(field: keyof Advertisement, value: string | number): void {
    this.draft.update((row) => (row ? { ...row, [field]: value } : row));
  }
  protected async save(): Promise<void> {
    const value = this.draft();
    if (
      !value ||
      !value.name.trim() ||
      !value.shop ||
      !value.endDate ||
      !Number.isInteger(value.priority) ||
      value.priority < 1 ||
      value.priority > 3 ||
      new Date(value.endDate) < new Date(new Date().toDateString())
    ) {
      this.error.set(
        'Renseignez le nom, la boutique, une priorité de 1 à 3 et une date de fin à venir.',
      );
      return;
    }
    await this.api.saveAdvertisement(value);
    this.draft.set(null);
    await this.load();
  }
  protected async toggle(row: Advertisement): Promise<void> {
    await this.api.saveAdvertisement({
      ...row,
      status: row.status === 'Active' ? 'En pause' : 'Active',
    });
    await this.load();
  }
  protected async confirmDelete(): Promise<void> {
    const row = this.draft();
    if (!row) return;
    await this.api.deleteAdvertisement(row.id);
    this.draft.set(null);
    await this.load();
  }
}
