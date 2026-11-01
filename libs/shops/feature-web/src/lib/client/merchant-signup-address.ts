import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { currentPosition, MapboxApi } from '@talaprix/shared/data-access';
import { SelectCard } from '@talaprix/shared/ui-kit';
import { ShopPreviewStore } from '@talaprix/shops/data-access';
import { MerchantSignupState } from './merchant-signup-state';

@Component({
  selector: 'tpx-merchant-signup-address',
  imports: [SelectCard],
  templateUrl: './merchant-signup-address.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantSignupAddress {
  readonly shops = inject(ShopPreviewStore);
  readonly state = inject(MerchantSignupState);
  readonly communes = [
    'Choisir',
    'Gombe',
    'Lingwala',
    'Kinshasa',
    'Kasa-Vubu',
    'Limete',
    'Ngaliema',
  ].map((value) => ({ label: value, value }));

  readonly #mapbox = inject(MapboxApi);
  readonly addressInput =
    viewChild<ElementRef<HTMLInputElement>>('addressInput');
  readonly locating = signal<'idle' | 'locating' | 'done' | 'denied'>('idle');
  readonly locateMessage = signal('');

  /** Saves the GPS position and, with Mapbox, pre-fills the address. */
  async locate(): Promise<void> {
    this.locating.set('locating');
    this.locateMessage.set('');
    const position = await currentPosition();
    if (!position) {
      this.locating.set('denied');
      this.locateMessage.set(
        'Localisation refusée ou indisponible. Saisissez l’adresse à la main.',
      );
      return;
    }
    this.shops.merchantPosition.set(position);
    const address = await this.#mapbox
      .reverseGeocode(position)
      .catch(() => null);
    const input = this.addressInput()?.nativeElement;
    if (address && input && !input.value.trim()) {
      input.value = address;
      this.state.clearError('address');
    }
    this.locating.set('done');
    this.locateMessage.set(
      address
        ? 'Position enregistrée et adresse proposée. Vérifiez-la avant d’envoyer.'
        : 'Position GPS enregistrée. Elle sera jointe à votre demande.',
    );
  }

  selectCommune(value: string): void {
    this.shops.merchantCommune.set(value);
    this.state.clearError('commune');
  }
}
