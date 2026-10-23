import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideEye,
  LucidePencil,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { AdminDialog } from '../../ui/admin-dialog';
import { Pagination } from '../../ui/pagination';
import type { ShopOffer } from '../shop-models';
import { ShopStore, formatShopPrice } from '../shop-store';
import { ShopOfferDialog } from './shop-offer-dialog';

@Component({
  selector: 'tp-shop-offers-page',
  host: { class: 'grid min-w-0 content-start items-start gap-6' },
  imports: [
    FormsModule,
    LucideEye,
    LucidePencil,
    LucidePlus,
    LucideTrash2,
    AdminDialog,
    Pagination,
    ShopOfferDialog,
  ],
  templateUrl: './shop-offers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopOffersPage {
  protected readonly store = inject(ShopStore);
  protected readonly price = formatShopPrice;
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly filter = signal<
    'Toutes' | 'Visibles' | 'Masquées' | 'Épuisées' | 'Brouillons'
  >('Toutes');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly confirmHide = signal(false);
  protected readonly editing = signal<{
    offer: ShopOffer;
    mode: 'create' | 'edit' | 'delete';
  } | null>(null);
  protected readonly selected = computed(
    () =>
      this.store.data()?.offers.find((row) => row.id === this.selectedId()) ??
      null,
  );
  protected readonly filters = [
    'Toutes',
    'Visibles',
    'Masquées',
    'Épuisées',
    'Brouillons',
  ] as const;
  protected readonly offers = computed(() =>
    (this.store.data()?.offers ?? []).filter(
      (row) =>
        (this.filter() === 'Toutes' ||
          (this.filter() === 'Visibles' &&
            row.publication === 'published' &&
            row.visibility === 'visible') ||
          (this.filter() === 'Masquées' &&
            row.publication === 'published' &&
            row.visibility === 'hidden') ||
          (this.filter() === 'Épuisées' &&
            row.availability === 'out_of_stock') ||
          (this.filter() === 'Brouillons' && row.publication === 'draft')) &&
        `${row.product} ${row.category}`
          .toLocaleLowerCase('fr')
          .includes(this.query().toLocaleLowerCase('fr')),
    ),
  );
  protected readonly currentPage = computed(() =>
    Math.min(
      this.page(),
      Math.max(1, Math.ceil(this.offers().length / this.pageSize)),
    ),
  );
  protected readonly visibleOffers = computed(() =>
    this.offers().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );

  protected visibilityLabel(offer: ShopOffer): string {
    return offer.publication === 'draft'
      ? 'Brouillon'
      : offer.visibility === 'hidden'
        ? 'Masquée'
        : 'Visible';
  }

  protected availabilityLabel(offer: ShopOffer): string {
    return offer.availability === 'out_of_stock' ? 'Stock épuisé' : 'En stock';
  }

  protected blankOffer(): ShopOffer {
    return {
      id: `offer-${Date.now()}`,
      shopId: this.store.data()?.shop.id ?? '',
      product: '',
      category: 'Téléphones',
      price: 1,
      currency: 'CDF',
      publication: 'published',
      visibility: 'visible',
      availability: 'in_stock',
      updatedAt: 'À l’instant',
      images: [],
      engagement: {
        '7d': {
          contactPeople: 0,
          locatePeople: 0,
          favoritePeople: 0,
          views: 0,
        },
        '30d': {
          contactPeople: 0,
          locatePeople: 0,
          favoritePeople: 0,
          views: 0,
        },
      },
    };
  }
  protected openCreate(): void {
    this.editing.set({ offer: this.blankOffer(), mode: 'create' });
  }
  protected edit(offer: ShopOffer): void {
    this.editing.set({ offer: structuredClone(offer), mode: 'edit' });
  }
  protected remove(offer: ShopOffer): void {
    this.editing.set({ offer, mode: 'delete' });
  }
  protected saveOffer(offer: ShopOffer): void {
    if (this.store.saveOffer(offer)) this.editing.set(null);
  }
  protected deleteOffer(): void {
    const current = this.editing();
    if (current && this.store.deleteOffer(current.offer.id))
      this.editing.set(null);
  }
  protected categories(): string[] {
    return [
      ...new Set((this.store.data()?.offers ?? []).map((row) => row.category)),
    ];
  }

  protected setVisibility(
    offer: ShopOffer,
    visibility: 'visible' | 'hidden',
  ): void {
    if (this.store.updateOffer(offer.id, { visibility }))
      this.confirmHide.set(false);
  }

  protected setAvailability(
    offer: ShopOffer,
    availability: 'in_stock' | 'out_of_stock',
  ): void {
    this.store.updateOffer(offer.id, { availability });
  }
}
