import {
  ChangeDetectionStrategy,
  Component,
  signal,
  input,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminEditField } from '../../ui/admin-edit-field';
import { AdminSelect } from '../../ui/admin-select';
import type { Row } from './admin-live-row';

@Component({
  selector: 'tp-admin-live-offer-fields',
  imports: [FormsModule, AdminSelect, AdminEditField],
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
  readonly productImages = input<Record<string, string>>({});
  readonly currencyIds = input<readonly string[]>([]);
  readonly currencies = input<Record<string, string>>({});
  readonly currency = model('');
  readonly shopId = model('');
  readonly productId = model('');
  readonly productQuery = model('');
  readonly price = model('');
  readonly offerSource = model('');
  readonly expanded = signal(false);
  readonly active = signal(-1);
  typeQuery(value: string) {
    this.productQuery.set(value);
    this.productId.set('');
    this.active.set(-1);
    this.expanded.set(true);
    this.search.emit();
  }
  choose(id: string) {
    this.productId.set(id);
    this.productQuery.set(this.productLabels()[id] ?? '');
    this.expanded.set(false);
  }
  key(event: KeyboardEvent) {
    const items = this.productIds();
    if (event.key === 'Escape') {
      this.expanded.set(false);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.expanded() && items[this.active()])
        this.choose(items[this.active()]);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.expanded.set(true);
      this.active.set(
        Math.max(
          0,
          Math.min(
            items.length - 1,
            this.active() + (event.key === 'ArrowDown' ? 1 : -1),
          ),
        ),
      );
      document
        .getElementById('offer-match-' + this.active())
        ?.scrollIntoView({ block: 'nearest' });
    }
  }
  readonly search = output<void>();
}
