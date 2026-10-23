import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  output,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideMapPin, LucidePencil, LucideSearch } from '@lucide/angular';
import type { Offer, Product, Shop } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { StatusDot } from '../../ui/status-dot';
import { Pagination } from '../../ui/pagination';
import { AdminCurrencyStore } from '../../services/admin-currency-store';

@Component({
  selector: 'tp-shop-dialog',
  imports: [
    FormsModule,
    LucideMapPin,
    LucidePencil,
    LucideSearch,
    AdminDialog,
    StatusDot,
    Pagination,
  ],
  templateUrl: './shop-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopDialog {
  protected readonly currency = inject(AdminCurrencyStore);
  readonly shop = input.required<Shop>();
  readonly offers = input.required<Offer[]>();
  readonly products = input.required<Product[]>();
  readonly mode = input.required<'edit' | 'suspend' | 'delete'>();
  readonly error = input('');
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly suspended = output<void>();
  readonly removed = output<void>();
  protected readonly offerPage = signal(1);
  protected readonly offerQuery = signal('');
  protected readonly offerPageSize = 5;
  protected readonly filteredOffers = computed(() => {
    const query = this.offerQuery().trim().toLocaleLowerCase('fr');
    if (!query) return this.offers();
    return this.offers().filter((offer) =>
      `${this.offerName(offer)} ${offer.status}`
        .toLocaleLowerCase('fr')
        .includes(query),
    );
  });
  protected readonly currentOfferPage = computed(() =>
    Math.min(
      this.offerPage(),
      Math.max(1, Math.ceil(this.filteredOffers().length / this.offerPageSize)),
    ),
  );
  protected readonly visibleOffers = computed(() =>
    this.filteredOffers().slice(
      (this.currentOfferPage() - 1) * this.offerPageSize,
      this.currentOfferPage() * this.offerPageSize,
    ),
  );
  protected offerName(offer: Offer): string {
    return (
      this.products().find((product) => product.id === offer.productId)?.name ??
      'Produit'
    );
  }
  protected offerPrice(offer: Offer): string {
    return this.currency.format(offer.price, offer.currency);
  }
  protected readonly shopFields = [
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'address', label: 'Adresse', type: 'text' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    { key: 'contact', label: 'Contact', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'lat', label: 'Latitude', type: 'number' },
    { key: 'lon', label: 'Longitude', type: 'number' },
  ] as const;
  protected readonly editing = signal(new Set<string>());
  protected isEditing(field: string): boolean {
    return this.editing().has(field);
  }
  protected edit(field: string): void {
    this.editing.update((current) => new Set(current).add(field));
  }
  protected fieldValue(
    shop: Shop,
    field: (typeof this.shopFields)[number]['key'],
  ): string | number {
    return shop[field] ?? '';
  }
  protected setField(
    shop: Shop,
    field: (typeof this.shopFields)[number]['key'],
    value: string | number,
  ): void {
    if (field === 'lat' || field === 'lon') {
      shop[field] = value === '' ? undefined : Number(value);
    } else {
      shop[field] = String(value);
    }
  }
  protected offerTone(value: Offer['status']): 'success' | 'neutral' {
    return value === 'Active' ? 'success' : 'neutral';
  }
  protected tone(value: string): 'success' | 'warning' | 'danger' {
    return value === 'Active'
      ? 'success'
      : value === 'Suspendue'
        ? 'danger'
        : 'warning';
  }
}
