import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideEye,
  LucideEyeOff,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';
import { AdminMockApi } from '../../services/admin-mock-api';
import {
  CategoryPreviewStore,
  type PreviewCategory,
} from '../../services/category-preview-store';
import { PageHeader } from '../../ui/page-header';
import { AdminDialog } from '../../ui/admin-dialog';
import { Pagination } from '../../ui/pagination';
import type { Product } from '../../mocks/models';
import { SingleImagePicker } from '../../ui/single-image-picker';
import { AdminSelect } from '../../ui/admin-select';
import { imagePath } from '../../mocks/catalogue';

@Component({
  selector: 'tp-categories-page',
  host: { class: 'grid min-w-0 content-start gap-6' },
  imports: [
    FormsModule,
    PageHeader,
    AdminDialog,
    Pagination,
    SingleImagePicker,
    AdminSelect,
    LucideEye,
    LucideEyeOff,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideTrash2,
  ],
  templateUrl: './categories-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  private readonly api = inject(AdminMockApi);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(CategoryPreviewStore);
  protected readonly products = signal<Product[]>([]);
  protected readonly query = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly feedback = signal('');
  protected readonly editing = signal<PreviewCategory | null>(null);
  protected readonly previousName = signal('');
  protected readonly busy = signal(false);
  protected readonly visibilityFilter = signal<
    'Toutes' | 'Visibles' | 'Masquées'
  >('Toutes');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly imagePath = imagePath;
  protected readonly parentOptions = computed(() => {
    const row = this.editing();
    const excluded = row
      ? new Set([row.id, ...this.store.descendantIds(row.id)])
      : new Set<number>();
    return [
      'none|Aucune — catégorie principale',
      ...this.store
        .categories()
        .filter((candidate) => !excluded.has(candidate.id))
        .map((candidate) => `${candidate.id}|${candidate.name}`),
    ];
  });
  protected readonly parentLabels = computed(() =>
    Object.fromEntries(
      this.parentOptions().map((option) => [
        option,
        option.slice(option.indexOf('|') + 1),
      ]),
    ),
  );
  protected readonly visibilityTarget = signal<PreviewCategory | null>(null);
  protected readonly filtered = computed(() =>
    this.store
      .categories()
      .filter(
        (row) =>
          this.visibilityFilter() === 'Toutes' ||
          (this.visibilityFilter() === 'Visibles'
            ? this.store.isEffectivelyVisible(row)
            : !this.store.isEffectivelyVisible(row)),
      )
      .filter((row) =>
        `${row.name} ${row.description}`
          .toLocaleLowerCase('fr')
          .includes(this.query().trim().toLocaleLowerCase('fr')),
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

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.query.set(params.get('q') ?? '');
      this.page.set(1);
    });
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.products.set(await this.api.listProducts());
    } catch {
      this.error.set('Impossible de charger les produits liés aux catégories.');
    } finally {
      this.loading.set(false);
    }
  }
  protected productCount(name: string): number {
    return this.products().filter(
      (product) => product.category === name && product.status !== 'Archivé',
    ).length;
  }
  protected open(row?: PreviewCategory): void {
    this.error.set('');
    this.previousName.set(row?.name ?? '');
    this.editing.set(
      row
        ? { ...row }
        : {
            id: Date.now(),
            name: '',
            description: '',
            image: '',
            parentId: null,
            isClientVisible: true,
          },
    );
  }
  protected parentSelection(row: PreviewCategory): string {
    return row.parentId === null
      ? 'none|Aucune — catégorie principale'
      : `${row.parentId}|${this.store.categories().find((item) => item.id === row.parentId)?.name ?? ''}`;
  }
  protected changeParent(row: PreviewCategory, selection: string): void {
    row.parentId = selection.startsWith('none|')
      ? null
      : Number(selection.split('|')[0]);
    this.error.set('');
  }
  protected visibilityLabel(row: PreviewCategory): string {
    if (this.store.isEffectivelyVisible(row)) return 'Visible';
    if (row.isClientVisible && row.parentId !== null)
      return 'Masquée par le parent';
    return 'Masquée';
  }
  protected askVisibility(row: PreviewCategory): void {
    this.visibilityTarget.set(row);
  }
  protected async confirmVisibility(): Promise<void> {
    const row = this.visibilityTarget();
    if (!row || this.busy()) return;
    this.busy.set(true);
    const affected = this.store.toggleVisibility(row.id);
    await this.api.recordAction(
      row.isClientVisible
        ? 'Masquage de catégorie'
        : 'Réaffichage de catégorie',
      `${row.name} · ${affected.length} catégories`,
    );
    this.feedback.set(
      row.isClientVisible
        ? `${affected.length} catégorie(s) masquée(s).`
        : `${affected.length} catégorie(s) réaffichée(s).`,
    );
    this.visibilityTarget.set(null);
    this.busy.set(false);
  }
  protected async save(): Promise<void> {
    const row = this.editing();
    if (!row || this.busy()) return;
    if (!this.previousName() && !row.image) {
      this.error.set('Ajoutez une image pour créer la catégorie.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      const previous = this.previousName();
      this.store.save(row);
      if (previous && previous !== row.name.trim()) {
        await this.api.renameProductCategory(previous, row.name.trim());
        this.products.set(await this.api.listProducts());
      } else
        await this.api.recordAction(
          previous ? 'Modification de catégorie' : 'Création de catégorie',
          row.name.trim(),
        );
      this.feedback.set('Catégorie enregistrée.');
      this.editing.set(null);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  protected async remove(row: PreviewCategory): Promise<void> {
    if (this.productCount(row.name) > 0 || this.busy()) return;
    this.busy.set(true);
    this.store.remove(row.id);
    await this.api.recordAction('Suppression de catégorie', row.name);
    this.feedback.set('Catégorie supprimée.');
    this.busy.set(false);
  }
}
