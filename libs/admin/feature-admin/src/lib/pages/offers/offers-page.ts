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
import type { Offer, Product } from '../../mocks/models';
import { EmptyState } from '../../ui/empty-state';
import { PageHeader } from '../../ui/page-header';
import { Pagination } from '../../ui/pagination';
import { imagePath } from '../../mocks/catalogue';
import { CategoryPreviewStore } from '../../services/category-preview-store';
import { AdminCurrencyStore } from '../../services/admin-currency-store';
import { OfferDialog, type ProductProposal } from './offer-dialog';

@Component({
  selector: 'tp-admin-offers-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [
    FormsModule,
    EmptyState,
    PageHeader,
    Pagination,
    OfferDialog,
    LucidePause,
    LucidePencil,
    LucidePlay,
    LucidePlus,
    LucideTrash2,
  ],
  templateUrl: './offers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersPage {
  private readonly api = inject(AdminMockApi);
  protected readonly categoryStore = inject(CategoryPreviewStore);
  protected readonly currency = inject(AdminCurrencyStore);
  protected readonly rows = signal<Offer[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly shops = signal<string[]>([]);
  protected readonly query = signal('');
  protected readonly selected = signal<Offer | null>(null);
  protected readonly creating = signal(false);
  protected readonly mode = signal<'edit' | 'pause' | 'resume' | 'delete'>(
    'edit',
  );
  protected readonly error = signal('');
  protected readonly toast = signal('');
  protected readonly loading = signal(true);
  protected readonly proposing = signal(false);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly imagePath = imagePath;
  protected priceFor(row: Offer): string {
    return this.currency.format(row.price, row.currency);
  }
  protected productFor(row: Offer): Product | undefined {
    return this.products().find((product) => product.id === row.productId);
  }
  protected readonly filtered = computed(() =>
    this.rows().filter((row) =>
      `${this.products().find((product) => product.id === row.productId)?.name ?? ''} ${row.shop}`
        .toLocaleLowerCase('fr')
        .includes(this.query().toLocaleLowerCase('fr')),
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
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [offers, products, shops] = await Promise.all([
        this.api.listOffers(),
        this.api.listProducts(),
        this.api.listShops(),
      ]);
      this.rows.set(offers);
      this.products.set(products);
      this.shops.set(shops.map((shop) => shop.name));
      this.error.set('');
    } catch {
      this.error.set('Les offres ne peuvent pas être chargées.');
    } finally {
      this.loading.set(false);
    }
  }
  protected create(): void {
    if (this.loading() || !this.products().length || !this.shops().length)
      return;
    this.creating.set(true);
    this.mode.set('edit');
    this.error.set('');
    this.selected.set({
      id: Date.now(),
      productId: 0,
      shop: this.shops()[0] ?? '',
      price: 0,
      currency: 'CDF',
      status: 'Active',
      updated: 'Aujourd’hui',
      images: [],
    });
  }
  protected open(
    row: Offer,
    mode: 'edit' | 'pause' | 'resume' | 'delete',
  ): void {
    this.creating.set(false);
    this.mode.set(mode);
    this.error.set('');
    this.selected.set(structuredClone(row));
  }
  protected async proposeProduct(proposal: ProductProposal): Promise<void> {
    if (this.proposing()) return;
    this.proposing.set(true);
    const product: Product = {
      id: Date.now() + 1,
      name: proposal.name,
      category: proposal.category,
      unit: '',
      status: 'Brouillon',
      updated: 'Aujourd’hui',
      image: proposal.images[0],
      images: proposal.images,
      description: '',
    };
    try {
      await this.api.saveProduct(product);
      this.products.set(await this.api.listProducts());
      this.selected.update((offer) =>
        offer
          ? {
              ...offer,
              productId: product.id,
              images: proposal.images,
              status: 'En pause',
            }
          : offer,
      );
      this.error.set('');
      this.toast.set(
        'Fiche créée en brouillon. Publiez-la avant d’activer l’offre.',
      );
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Création du produit impossible.',
      );
    } finally {
      this.proposing.set(false);
    }
  }
  protected async save(): Promise<void> {
    if (this.proposing()) return;
    const row = this.selected();
    if (
      !row ||
      !row.productId ||
      !row.shop ||
      !Number.isFinite(row.price) ||
      row.price <= 0
    ) {
      this.error.set(
        'Choisissez un produit, une boutique et un prix supérieur à zéro.',
      );
      return;
    }
    try {
      await this.api.saveOffer(row);
      this.selected.set(null);
      this.toast.set('Offre enregistrée.');
      await this.load();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Enregistrement impossible.',
      );
    }
  }
  protected async toggle(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      await this.api.saveOffer({
        ...row,
        status: row.status === 'Active' ? 'En pause' : 'Active',
      });
      this.selected.set(null);
      await this.load();
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'Changement d’état impossible.',
      );
    }
  }
  protected async remove(): Promise<void> {
    const row = this.selected();
    if (!row) return;
    try {
      await this.api.deleteOffer(row.id);
      this.selected.set(null);
      await this.load();
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Suppression impossible.',
      );
    }
  }
}
