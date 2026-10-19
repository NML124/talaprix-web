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
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/empty-state';
import { StatusDot } from '../../ui/status-dot';
import { Pagination } from '../../ui/pagination';
import { fc, imagePath } from '../../mocks/catalogue';
import type { Product, Shop } from '../../mocks/models';
import { ShopDialog } from './shop-dialog';

@Component({
  selector: 'tp-shops-page',
  imports: [
    FormsModule,
    PageHeader,
    EmptyState,
    StatusDot,
    Pagination,
    LucidePlus,
    LucidePencil,
    LucidePause,
    LucidePlay,
    LucideTrash2,
    ShopDialog,
  ],
  templateUrl: './shops-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopsPage {
  private readonly api = inject(AdminMockApi);
  protected readonly shops = signal<Shop[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly selected = signal<Shop | null>(null);
  protected readonly dialogMode = signal<'edit' | 'suspend' | 'delete'>('edit');
  protected readonly filter = signal('Toutes');
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly imagePath = imagePath;
  protected readonly fc = fc;
  protected readonly filters = [
    { label: 'Toutes', count: 28 },
    { label: 'Actives', count: 24 },
    { label: 'À compléter', count: 4 },
    { label: 'Suspendues', count: 2 },
  ];
  protected readonly filtered = computed(() =>
    this.shops().filter(
      (shop) =>
        (this.filter() === 'Toutes' ||
          shop.status ===
            (this.filter() === 'Actives'
              ? 'Active'
              : this.filter() === 'Suspendues'
                ? 'Suspendue'
                : 'À compléter')) &&
        `${shop.name} ${shop.commune}`
          .toLowerCase()
          .includes(this.query().toLowerCase()),
    ),
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
    ),
  );
  protected readonly visible = computed(() =>
    this.filtered().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  protected readonly relatedProducts = computed(() =>
    this.products().filter(
      (row) =>
        row.shop ===
        this.shops().find((shop) => shop.id === this.selected()?.id)?.name,
    ),
  );
  constructor() {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const [rows, products] = await Promise.all([
        this.api.listShops(),
        this.api.listProducts(),
      ]);
      this.shops.set(rows);
      this.products.set(products);
    } catch {
      this.error.set('Les boutiques ne peuvent pas être chargées.');
    } finally {
      this.loading.set(false);
    }
  }
  protected select(
    row: Shop,
    mode: 'edit' | 'suspend' | 'delete' = 'edit',
  ): void {
    this.selected.set(structuredClone(row));
    this.dialogMode.set(mode);
    this.toast.set('');
    this.error.set('');
  }
  protected changePage(page: number): void {
    this.page.set(page);
  }
  protected add(): void {
    this.dialogMode.set('edit');
    this.selected.set({
      id: Date.now(),
      name: '',
      commune: '',
      address: '',
      products: 0,
      rating: '—',
      fresh: 0,
      completion: 0,
      status: 'À compléter',
      phone: '',
      contact: '',
      email: '',
    });
  }
  protected async save(): Promise<void> {
    const row = this.selected();
    if (!row?.name.trim() || !row.address.trim()) {
      this.error.set('Renseignez le nom et l’adresse.');
      return;
    }
    try {
      await this.api.saveShop(row);
      this.shops.set(await this.api.listShops());
      this.toast.set(
        'Boutique enregistrée. Action ajoutée au journal d’audit.',
      );
      this.selected.set(null);
      this.error.set('');
    } catch {
      this.error.set('Enregistrement impossible.');
    }
  }
  protected async suspend(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      row.status = row.status === 'Suspendue' ? 'Active' : 'Suspendue';
      await this.api.saveShop(row);
      this.shops.set(await this.api.listShops());
      this.selected.set(null);
      this.toast.set('Statut de boutique modifié et audité.');
    } catch {
      this.error.set('Changement de statut impossible.');
    }
  }
  protected async remove(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      await this.api.deleteShop(row.id);
      this.shops.set(await this.api.listShops());
      this.selected.set(null);
      this.toast.set('Boutique supprimée de la maquette et action auditée.');
    } catch {
      this.error.set('Suppression impossible.');
    }
  }
  protected tone(value: string): 'success' | 'warning' | 'danger' {
    return value === 'Active'
      ? 'success'
      : value === 'Suspendue'
        ? 'danger'
        : 'warning';
  }
}
