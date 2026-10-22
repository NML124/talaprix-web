import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Product } from '../../mocks/models';
import { AdminDialog } from '../../ui/admin-dialog';
import { ProductImages } from '../../ui/product-images';
import { AdminSelect } from '../../ui/admin-select';

@Component({
  selector: 'tp-product-dialog',
  imports: [FormsModule, AdminDialog, ProductImages, AdminSelect],
  templateUrl: './product-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDialog {
  readonly product = input.required<Product>();
  readonly categories = input.required<string[]>();
  readonly shops = input.required<string[]>();
  readonly mode = input.required<'edit' | 'archive' | 'restore' | 'delete'>();
  readonly error = input('');
  readonly closed = output<void>();
  readonly saved = output<void>();
  readonly archived = output<void>();
  readonly restored = output<void>();
  readonly removed = output<void>();
  readonly imagesChanged = output<string[]>();
}
