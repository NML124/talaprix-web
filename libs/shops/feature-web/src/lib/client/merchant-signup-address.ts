import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  currentPosition,
  MapboxApi,
  type PlaceSuggestion,
} from '@talaprix/shared/data-access';
import { SelectCard } from '@talaprix/shared/ui-kit';
import {
  KINSHASA_COMMUNES,
  ShopPreviewStore,
} from '@talaprix/shops/data-access';
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
    { label: 'Choisir', value: 'Choisir' },
    ...KINSHASA_COMMUNES.map((value) => ({ label: value, value })),
  ];

  readonly #mapbox = inject(MapboxApi);
  readonly addressInput =
    viewChild<ElementRef<HTMLInputElement>>('addressInput');
  readonly streetInput = viewChild<ElementRef<HTMLInputElement>>('streetInput');
  readonly districtInput =
    viewChild<ElementRef<HTMLInputElement>>('districtInput');
  readonly numberInput = viewChild<ElementRef<HTMLInputElement>>('numberInput');
  readonly locating = signal<'idle' | 'locating' | 'done' | 'denied'>('idle');
  readonly locateMessage = signal('');
  readonly addressMatches = signal<readonly PlaceSuggestion[]>([]);
  readonly searchingAddress = signal(false);
  readonly addressSearchError = signal('');

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
    if (input) {
      input.value =
        address ??
        `Position GPS ${position.lat.toFixed(5)}, ${position.lon.toFixed(5)}`;
      this.state.clearError('address');
    }
    this.locating.set('done');
    this.locateMessage.set(
      address
        ? 'Position enregistrée et adresse proposée. Vérifiez-la avant d’envoyer.'
        : 'Position GPS enregistrée et ajoutée à l’adresse. Complétez-la si besoin.',
    );
  }

  async searchAddress(): Promise<void> {
    const parts = [
      this.numberInput()?.nativeElement.value,
      this.streetInput()?.nativeElement.value,
      this.districtInput()?.nativeElement.value,
      this.shops.merchantCommune(),
      'Kinshasa',
      'RDC',
    ].filter((part): part is string => Boolean(part?.trim()));
    if (parts.length < 4) {
      this.addressSearchError.set(
        'Renseignez la commune, le quartier et la rue pour trouver la position.',
      );
      return;
    }
    this.searchingAddress.set(true);
    this.addressSearchError.set('');
    try {
      const matches = await this.#mapbox.searchPlaces(parts.join(', '));
      this.addressMatches.set(matches);
      if (!matches.length)
        this.addressSearchError.set(
          'Aucun résultat précis. Essayez le nom de l’avenue ou utilisez le GPS.',
        );
    } catch (error) {
      this.addressSearchError.set(
        error instanceof Error
          ? error.message
          : 'Recherche d’adresse indisponible.',
      );
    } finally {
      this.searchingAddress.set(false);
    }
  }

  chooseAddress(place: PlaceSuggestion): void {
    this.shops.merchantPosition.set({ lat: place.lat, lon: place.lon });
    this.addressMatches.set([]);
    this.locating.set('done');
    this.locateMessage.set(
      `Position sélectionnée : ${place.name}. Vérifiez les détails saisis avant l’envoi.`,
    );
  }

  selectCommune(value: string): void {
    this.shops.merchantCommune.set(value);
    this.state.clearError('commune');
  }
}
