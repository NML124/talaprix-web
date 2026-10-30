import { computed, Service, signal } from '@angular/core';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
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
  readonly merchantCategories = signal<readonly string[]>([]);
  readonly merchantSent = signal(false);
  readonly merchantError = signal('');
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
  submitMerchant(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const phone = form.querySelector<HTMLInputElement>('input[type="tel"]');
    const digits = (phone?.value ?? '').replace(/\D/g, '').replace(/^243/, '');
    if (!/^\d{9}$/.test(digits)) {
      this.merchantError.set('Numéro incomplet : 9 chiffres après +243.');
      phone?.focus();
      return;
    }
    if (!form.reportValidity()) return;
    this.merchantError.set('');
    this.merchantSent.set(true);
  }
}
