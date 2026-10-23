import { computed, Service, signal } from '@angular/core';

export type AdminDisplayCurrency = 'CDF' | 'USD';

/** Devise de présentation du panneau ; le taux sera alimenté par le catalogue au raccordement API. */
@Service()
export class AdminCurrencyStore {
  readonly #currency = signal<AdminDisplayCurrency>('CDF');
  readonly #cdfPerUsd = 2250;
  readonly currency = this.#currency.asReadonly();
  readonly label = computed(() => (this.currency() === 'CDF' ? 'FC' : 'USD'));
  readonly rateHint = computed(
    () =>
      `Taux indicatif : 1 USD = ${new Intl.NumberFormat('fr-FR').format(this.#cdfPerUsd)} FC`,
  );

  setCurrency(currency: AdminDisplayCurrency): void {
    this.#currency.set(currency);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('talaprix-admin-currency', currency);
    }
  }

  format(amount: number, source: AdminDisplayCurrency = 'CDF'): string {
    const target = this.currency();
    const converted =
      source === target
        ? amount
        : source === 'USD'
          ? amount * this.#cdfPerUsd
          : amount / this.#cdfPerUsd;
    const digits = target === 'USD' ? 2 : 0;
    const value = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(converted);
    return `${value} ${target === 'CDF' ? 'FC' : 'USD'}`;
  }

  formatMillionsFromCdf(amount: number): string {
    const converted =
      this.currency() === 'USD' ? amount / this.#cdfPerUsd : amount;
    const value = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2,
    }).format(converted);
    return `${value} M ${this.currency() === 'CDF' ? 'FC' : 'USD'}`;
  }
}
