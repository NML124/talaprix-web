import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { AdminMockApi } from '../../services/admin-mock-api';
import { PageHeader } from '../../ui/page-header';
import { SegmentedTabs } from '../../ui/segmented-tabs';
import { StatusDot } from '../../ui/status-dot';
import { EmptyState } from '../../ui/empty-state';
import { Pagination } from '../../ui/pagination';
import { imagePath } from '../../mocks/catalogue';
import type { Product } from '../../mocks/models';
import { ProductDialog } from './product-dialog';
import { CategoryPreviewStore } from '../../services/category-preview-store';
import { AdminSelect } from '../../ui/admin-select';

@Component({
  selector: 'tp-catalogue-page',
  imports: [
    FormsModule,
    RouterLink,
    PageHeader,
    SegmentedTabs,
    StatusDot,
    EmptyState,
    Pagination,
    LucidePlus,
    LucidePencil,
    LucidePause,
    LucidePlay,
    LucideTrash2,
    ProductDialog,
    AdminSelect,
  ],
  templateUrl: './catalogue-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguePage {
  private readonly api = inject(AdminMockApi);
  private readonly route = inject(ActivatedRoute);
  protected readonly categoryStore = inject(CategoryPreviewStore);
  protected readonly products = signal<Product[]>([]);
  protected readonly selected = signal<Product | null>(null);
  protected readonly dialogMode = signal<
    'edit' | 'archive' | 'restore' | 'delete'
  >('edit');
  protected readonly tab = signal('Publiés 2 486');
  protected readonly query = signal('');
  protected readonly category = signal('Toutes les catégories');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly imagePath = imagePath;
  protected readonly tabs = ['Publiés 2 486', 'Brouillons 38', 'Archivés 124'];
  protected readonly categories = computed(() => [
    'Toutes les catégories',
    ...this.categoryStore.names(),
  ]);
  protected readonly filtered = computed(() =>
    this.products().filter((row) => {
      const group = this.tab().startsWith('Publiés')
        ? row.status === 'Publié' || row.status === 'À revoir'
        : this.tab().startsWith('Brouillons')
          ? row.status === 'Brouillon'
          : row.status === 'Archivé';
      return (
        group &&
        `${row.name} ${row.category}`
          .toLowerCase()
          .includes(this.query().toLowerCase()) &&
        (this.category() === 'Toutes les catégories' ||
          row.category === this.category())
      );
    }),
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

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => this.query.set(params.get('q') ?? ''));
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const rows = await this.api.listProducts();
      this.products.set(rows);
    } catch {
      this.error.set('Le catalogue ne peut pas être chargé.');
    } finally {
      this.loading.set(false);
    }
  }
  protected select(
    row: Product,
    mode: 'edit' | 'archive' | 'restore' | 'delete' = 'edit',
  ): void {
    this.selected.set(structuredClone(row));
    this.dialogMode.set(mode);
    this.toast.set('');
    this.error.set('');
  }
  protected add(): void {
    this.dialogMode.set('edit');
    this.selected.set({
      id: Date.now(),
      name: '',
      category: this.categoryStore.names()[0] ?? '',
      unit: '',
      status: 'Brouillon',
      updated: 'Aujourd’hui',
      image: '',
      images: [],
      description: '',
    });
  }
  protected updateImages(images: string[]): void {
    const row = this.selected();
    if (!row) return;
    this.selected.set({ ...row, images, image: images[0] ?? '' });
  }
  protected async save(): Promise<void> {
    const row = this.selected();
    if (!row?.name.trim() || !row.category.trim() || !row.image) {
      this.error.set('Renseignez un nom, une catégorie et au moins une photo.');
      return;
    }
    this.error.set('');
    try {
      await this.api.saveProduct(row);
      this.products.set(await this.api.listProducts());
      this.toast.set('Produit enregistré. Action ajoutée au journal d’audit.');
      this.selected.set(null);
    } catch {
      this.error.set('Enregistrement impossible. Réessayez.');
    }
  }
  protected async archive(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    row.status = 'Archivé';
    await this.api.saveProduct(row);
    this.products.set(await this.api.listProducts());
    this.selected.set(null);
    this.toast.set('Produit archivé. Action ajoutée au journal d’audit.');
  }
  protected async restore(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    row.status = 'Publié';
    await this.api.saveProduct(row);
    this.products.set(await this.api.listProducts());
    this.selected.set(null);
    this.toast.set('Produit republié.');
  }
  protected async remove(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      await this.api.deleteProduct(row.id);
      this.products.set(await this.api.listProducts());
      this.selected.set(null);
      this.toast.set('Produit supprimé et action auditée.');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Suppression impossible.',
      );
    }
  }
  protected statusTone(value: string): 'success' | 'warning' | 'neutral' {
    return value === 'Publié'
      ? 'success'
      : value === 'À revoir'
        ? 'warning'
        : 'neutral';
  }
}
