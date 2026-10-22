import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { OfferDiscount } from '../../mocks/marketing';
import { AdminDialog } from '../../ui/admin-dialog';
import { AdminSelect } from '../../ui/admin-select';

@Component({
  selector: 'tp-offer-discount-dialog',
  imports: [AdminDialog, FormsModule, AdminSelect],
  templateUrl: './offer-discount-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDiscountDialog {
  readonly discount = input.required<OfferDiscount>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly closed = output<void>();
  readonly saved = output<OfferDiscount>();
  protected readonly draft = signal<OfferDiscount | null>(null);
  protected readonly error = signal('');

  protected value(): OfferDiscount {
    return this.draft() ?? this.discount();
  }
  protected change(field: keyof OfferDiscount, value: string | number): void {
    this.draft.set({ ...this.value(), [field]: value });
    this.error.set('');
  }
  protected save(): void {
    const value = this.value();
    if (!value.offer.trim() || !value.shop.trim()) {
      this.error.set('Renseignez l’offre et la boutique.');
      return;
    }
    if (value.newPrice <= 0 || value.oldPrice <= value.newPrice) {
      this.error.set('Le nouveau prix doit être inférieur à l’ancien.');
      return;
    }
    if (value.validUntil < value.validFrom) {
      this.error.set('La date de fin doit suivre la date de début.');
      return;
    }
    this.saved.emit(value);
  }
}
