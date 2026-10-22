import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideMapPin, LucidePencil } from '@lucide/angular';
import type { Product, Shop } from '../../mocks/models';
import { fc, imagePath } from '../../mocks/catalogue';
import { AdminDialog } from '../../ui/admin-dialog';
import { StatusDot } from '../../ui/status-dot';

@Component({
  selector: 'tp-shop-dialog',
  imports: [FormsModule, LucideMapPin, LucidePencil, AdminDialog, StatusDot],
  templateUrl: './shop-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopDialog {
  readonly shop = input.required<Shop>();
  readonly products = input.required<Product[]>();
  readonly mode = input.required<'edit' | 'suspend' | 'delete'>();
  readonly error = input('');
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly suspended = output<void>();
  readonly removed = output<void>();
  protected readonly fc = fc;
  protected readonly imagePath = imagePath;
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
  protected productTone(
    value: Product['status'],
  ): 'success' | 'warning' | 'neutral' | 'danger' {
    return value === 'Publié'
      ? 'success'
      : value === 'À revoir'
        ? 'warning'
        : value === 'Archivé'
          ? 'neutral'
          : 'danger';
  }
  protected tone(value: string): 'success' | 'warning' | 'danger' {
    return value === 'Active'
      ? 'success'
      : value === 'Suspendue'
        ? 'danger'
        : 'warning';
  }
}
