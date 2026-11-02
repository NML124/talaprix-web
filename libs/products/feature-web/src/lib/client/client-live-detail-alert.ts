import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ProductInsightsApi } from '@talaprix/products/data-access';
import { AuthGate } from '@talaprix/shared/data-access';
import { ClientLiveDetailStore } from './client-live-detail-store';
import { currencyLabel } from './client-live-detail-format';

/** Price alert dialog: notifies the user when the produit drops below a price. */
@Component({
  selector: 'tpx-client-live-detail-alert',
  templateUrl: './client-live-detail-alert.html',
  host: { class: 'contents', '(document:keydown.escape)': 'dismiss.emit()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientLiveDetailAlert {
  readonly store = inject(ClientLiveDetailStore);
  readonly #api = inject(ProductInsightsApi);
  readonly #gate = inject(AuthGate);
  readonly dismiss = output<void>();
  readonly value = signal('');
  readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  readonly error = signal('');
  readonly input = viewChild<ElementRef<HTMLInputElement>>('priceInput');
  readonly currency = computed(() => {
    const best = this.store.bestOffer();
    return best ? currencyLabel(best.currency) : '';
  });

  constructor() {
    afterNextRender(() => this.input()?.nativeElement.focus());
  }

  submit(): void {
    const price = Number(this.value().replace(',', '.'));
    const best = this.store.bestOffer();
    const reference = this.store.reference();
    if (!Number.isFinite(price) || price <= 0) {
      this.error.set('Saisissez un prix supérieur à zéro.');
      this.status.set('error');
      return;
    }
    if (!best || !reference) return;
    this.#gate.require(
      'Connectez-vous pour créer une alerte prix.',
      () => void this.send(reference.productId, price, best.deviseId ?? 'xxx'),
    );
  }

  private async send(
    productId: string,
    price: number,
    deviseId: string,
  ): Promise<void> {
    this.status.set('sending');
    this.error.set('');
    try {
      await this.#api.createAlert({ productId, price, deviseId });
      this.status.set('sent');
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Alerte indisponible.',
      );
      this.status.set('error');
    }
  }
}
