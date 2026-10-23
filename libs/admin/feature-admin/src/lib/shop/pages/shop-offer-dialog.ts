import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ShopOffer } from '../shop-models';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';
import { ProductImages } from '../../ui/product-images';

@Component({
  selector: 'tp-shop-offer-dialog',
  imports: [FormsModule, AdminDialog, AdminSelect, ProductImages],
  templateUrl: './shop-offer-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopOfferDialog {
  readonly offer = input.required<ShopOffer>();
  readonly mode = input.required<'create' | 'edit' | 'delete'>();
  readonly categories = input.required<string[]>();
  readonly closed = output<void>();
  readonly saved = output<ShopOffer>();
  readonly removed = output<void>();
  protected readonly draft = signal<ShopOffer | null>(null);
  protected readonly error = signal('');

  protected value(): ShopOffer {
    return this.draft() ?? this.offer();
  }
  protected change<K extends 'product' | 'category' | 'price'>(
    key: K,
    value: ShopOffer[K],
  ): void {
    this.draft.set({ ...this.value(), [key]: value });
    this.error.set('');
  }
  protected changeImages(images: string[]): void {
    this.draft.set({ ...this.value(), images });
  }
  protected save(): void {
    const value = this.value();
    if (!value.product.trim() || !value.category.trim() || value.price <= 0) {
      this.error.set(
        'Renseignez le produit, la catégorie et un prix supérieur à zéro.',
      );
      return;
    }
    this.saved.emit(value);
  }
}
