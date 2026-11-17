import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSelect } from '../../ui/admin-select';
import type { Row } from './admin-live-row';

@Component({
  selector: 'tp-admin-live-offer-fields',
  imports: [FormsModule, AdminSelect],
  templateUrl: './admin-live-offer-fields.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLiveOfferFields {
  readonly row = input<Row | null>(null);
  readonly loading = input(false);
  readonly shopIds = input<readonly string[]>([]);
  readonly shopLabels = input<Record<string, string>>({});
  readonly productIds = input<readonly string[]>([]);
  readonly productLabels = input<Record<string, string>>({});
  readonly shopId = model('');
  readonly productId = model('');
  readonly productQuery = model('');
  readonly price = model('');
  readonly offerSource = model('');
  readonly search = output<void>();
}
