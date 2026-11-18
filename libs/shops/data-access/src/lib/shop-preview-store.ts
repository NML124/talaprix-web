import { computed, inject, Service, signal } from '@angular/core';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { SupabaseFunctions } from '@talaprix/shared/data-access';
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
  readonly #functions = inject(SupabaseFunctions);
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
  readonly merchantPhotoData = signal<string | null>(null);
  readonly merchantPhotoError = signal('');
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
    this.merchantPhotoError.set('');
    this.merchantPhotoData.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.merchantPhotoError.set('Choisissez une image JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.merchantPhotoError.set('La photo doit faire 5 Mo ou moins.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.merchantPhotoData.set(
        typeof reader.result === 'string' ? reader.result : null,
      );
    };
    reader.onerror = () =>
      this.merchantPhotoError.set('Impossible de lire cette image.');
    reader.readAsDataURL(file);
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
  async completeMerchant(fields: MerchantSignup): Promise<void> {
    const position = this.merchantPosition();
    if (!position)
      throw new Error('Choisissez une position GPS pour la boutique.');
    const address = [
      fields.number.trim(),
      fields.street.trim(),
      fields.district.trim(),
      this.merchantCommune().trim(),
      fields.address.trim(),
      'Kinshasa',
      'RDC',
    ]
      .filter(Boolean)
      .join(', ');
    const phone = `${this.phonePrefix()}${this.merchantDigits(fields.phone)}`;
    const categories = this.merchantCategories().map((name) =>
      name === 'Autre' && this.merchantOtherCategory().trim()
        ? `Autre (${this.merchantOtherCategory().trim()})`
        : name,
    );
    await this.#functions.post('request-become-shop', {
      name: fields.name.trim(),
      lat: position.lat,
      lon: position.lon,
      profile_picture: this.merchantPhotoData(),
      address,
      phone_number: phone,
      categories,
    });
    this.merchantSummary.set(
      [
        'Bonjour, je souhaite référencer ma boutique sur TalaPrix.',
        `Boutique : ${fields.name}`,
        `Téléphone : ${phone}`,
        `Adresse : ${address}`,
        `Adresse indiquée : ${fields.address}`,
        `Coordonnées GPS : ${position.lat.toFixed(6)}, ${position.lon.toFixed(6)}`,
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
