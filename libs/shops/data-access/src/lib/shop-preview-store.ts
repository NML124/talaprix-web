import { computed, Service, signal } from '@angular/core';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { countries } from 'countries-list';
export interface MerchantSignup {
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly street: string;
  readonly district: string;
  readonly number: string;
}
@Service()
export class ShopPreviewStore {
  readonly selected = signal('UAC – Gombe');
  readonly category = signal('Toutes');
  readonly commune = signal('Toutes');
  readonly located = signal(true);
  readonly zoom = signal(1);
  readonly selectedShop = computed(
    () =>
      PUBLIC_DESIGN_DATA.shops.find((s) => s.name === this.selected()) ??
      PUBLIC_DESIGN_DATA.shops[0],
  );
  readonly selectedAddress = computed(() => this.selectedShop().address ?? '');
  readonly selectedDistance = computed(() =>
    this.selectedShop().distanceKm === undefined
      ? ''
      : String(this.selectedShop().distanceKm).replace('.', ','),
  );
  readonly phoneCountry = signal('CD');
  readonly phoneCountries = Object.entries(countries)
    .filter(([, country]) => country.phone.length > 0)
    .map(([code, country]) => ({
      value: code,
      label: `${code === 'CD' ? 'RDC' : code === 'CG' ? 'Congo' : country.name} (+${country.phone[0]})`,
      image: `/assets/flags/${code.toLowerCase()}.svg`,
    }))
    .sort((a, b) =>
      a.value === 'CD'
        ? -1
        : b.value === 'CD'
          ? 1
          : a.label.localeCompare(b.label),
    );
  /** Empty caption: the select trigger shows the flag image only. */
  readonly phoneFlag = computed(() => '');
  readonly phonePrefix = computed(() => {
    const code = this.phoneCountry() as keyof typeof countries;
    return `+${countries[code]?.phone[0] ?? 243}`;
  });
  readonly merchantCommune = signal('');
  readonly merchantCategories = signal<readonly string[]>([]);
  /** Free text when "Autre" is selected in "Ce que vous vendez". */
  readonly merchantOtherCategory = signal('');
  readonly merchantSent = signal(false);
  readonly merchantPhotoName = signal('');
  readonly merchantSummary = signal('');
  readonly merchantWhatsAppUrl = computed(
    () =>
      `https://wa.me/243980000147?text=${encodeURIComponent(this.merchantSummary())}`,
  );
  visible(name: string): boolean {
    const shop = PUBLIC_DESIGN_DATA.shops.find((s) => s.name === name);
    if (!shop) return true;
    return (
      (this.commune() === 'Toutes' || shop.commune === this.commune()) &&
      (this.category() === 'Toutes' ||
        shop.cats.toLowerCase().includes(this.category().toLowerCase()))
    );
  }
  select(name: string): void {
    this.selected.set(name);
  }
  setCommune(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.commune.set(!value || value.includes('Toutes') ? 'Toutes' : value);
  }
  toggleMerchantCategory(name: string): void {
    this.merchantCategories.update((a) =>
      a.includes(name) ? a.filter((n) => n !== name) : [...a, name],
    );
  }
  selectMerchantPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.merchantPhotoName.set(file?.name ?? '');
  }
  merchantDigits(raw: string): string {
    return raw.replace(/\D/g, '').replace(/^0+/, '');
  }
  merchantPhoneError(raw: string): string {
    const digits = this.merchantDigits(raw);
    if (!digits) return 'Saisissez votre numéro WhatsApp.';
    const total = this.phonePrefix().replace(/\D/g, '').length + digits.length;
    const cd = this.phoneCountry() === 'CD';
    if (total < 8 || total > 15 || (cd && digits.length !== 9))
      return cd
        ? 'Saisissez 9 chiffres après +243.'
        : 'Vérifiez le numéro pour le pays choisi.';
    return '';
  }
  /** GPS position captured with "Utiliser ma position", if any. */
  readonly merchantPosition = signal<{ lat: number; lon: number } | null>(null);
  completeMerchant(fields: MerchantSignup): void {
    const position = this.merchantPosition();
    this.merchantSummary.set(
      [
        'Bonjour, je souhaite référencer ma boutique sur TalaPrix.',
        `Boutique : ${fields.name}`,
        `Téléphone : ${this.phonePrefix()}${this.merchantDigits(fields.phone)}`,
        `Adresse : ${fields.address}`,
        `Avenue ou rue : ${fields.street}`,
        `Quartier : ${fields.district}`,
        `Numéro : ${fields.number || 'Non indiqué'}`,
        `Commune : ${this.merchantCommune()}`,
        ...(position
          ? [
              `Position GPS : https://www.google.com/maps?q=${position.lat.toFixed(6)},${position.lon.toFixed(6)}`,
            ]
          : []),
        `Produits : ${
          this.merchantCategories()
            .map((name) =>
              name === 'Autre' && this.merchantOtherCategory().trim()
                ? `Autre (${this.merchantOtherCategory().trim()})`
                : name,
            )
            .join(', ') || 'Non précisés'
        }`,
      ].join('\n'),
    );
    this.merchantSent.set(true);
  }
}
