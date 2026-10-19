import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideMapPin } from '@lucide/angular';
import type { Product, Shop } from '../../mocks/models';
import { fc, imagePath } from '../../mocks/catalogue';
import { AdminDialog } from '../../ui/admin-dialog';
import { StatusDot } from '../../ui/status-dot';

@Component({
  selector: 'tp-shop-dialog',
  imports: [FormsModule, LucideMapPin, AdminDialog, StatusDot],
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
  protected tone(value: string): 'success' | 'warning' | 'danger' {
    return value === 'Active'
      ? 'success'
      : value === 'Suspendue'
        ? 'danger'
        : 'warning';
  }
}
