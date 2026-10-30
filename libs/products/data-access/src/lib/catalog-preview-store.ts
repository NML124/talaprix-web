import { computed, inject, Service, signal } from '@angular/core';
import { PUBLIC_DESIGN_DATA } from '@talaprix/shared/models';
import { PreviewPreferences } from '@talaprix/shared/data-access';

@Service()
export class CatalogPreviewStore {
  readonly ui = inject(PreviewPreferences);
  readonly favorites = signal<readonly string[]>([
    'Samsung Galaxy S24 128 Go',
    'HP ProBook 440 G9',
    'EcoFlow River 2',
    'Apple AirPods Pro',
    'HP LaserJet Pro MFP M479fdw',
  ]);
  readonly alerts = signal<readonly string[]>([
    'Samsung Galaxy S24 128 Go',
    'EcoFlow River 2',
  ]);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);
  readonly brands = signal<readonly string[]>([]);
  readonly condition = signal('all');
  readonly category = signal('all');
  readonly sort = signal('relevance');
  readonly filtersOpen = signal(false);
  readonly addedNames = signal<readonly string[]>([]);
  readonly results = PUBLIC_DESIGN_DATA.searchResults_hp;
  readonly resultCount = computed(
    () => this.results.filter((p) => this.visible(p.name, p.fromUsd)).length,
  );
  readonly recent = signal<readonly string[]>([
    'Samsung Galaxy S24',
    'HP ProBook',
    'Panneau solaire',
  ]);
  favorite(name: string): boolean {
    return this.favorites().some((n) => name.startsWith(n));
  }
  toggleFavorite(name: string): void {
    this.favorites.update((items) =>
      this.favorite(name)
        ? items.filter((n) => !name.startsWith(n))
        : [...items, name],
    );
  }
  alert(name: string): boolean {
    return this.alerts().some((n) => name.startsWith(n));
  }
  toggleAlert(name: string): void {
    this.alerts.update((items) =>
      this.alert(name)
        ? items.filter((n) => !name.startsWith(n))
        : [...items, name],
    );
  }
  visible(name: string, price: number): boolean {
    const currencyFactor = this.ui.currency() === 'CDF' ? this.ui.rate : 1;
    const min = this.minPrice();
    const max = this.maxPrice();
    const query = this.ui.query().trim().toLowerCase();
    return (
      (!query ||
        query
          .split(/\s+/)
          .every((word) => name.toLowerCase().includes(word))) &&
      (min === null || price * currencyFactor >= min) &&
      (max === null || price * currencyFactor <= max) &&
      (!this.brands().length ||
        this.brands().some((b) =>
          name.toLowerCase().includes(b.toLowerCase()),
        )) &&
      (this.category() === 'all' ||
        (this.category() === 'Imprimantes'
          ? /jet|tank|laser/i.test(name)
          : this.category() === 'Accessoires'
            ? /souris/i.test(name)
            : /book|250/i.test(name)))
    );
  }
  rank(price: number, shops = 0): number {
    return this.sort() === 'price-asc'
      ? Math.round(price * 100)
      : this.sort() === 'price-desc'
        ? -Math.round(price * 100)
        : this.sort() === 'shops'
          ? -shops
          : 0;
  }
  setPrice(event: Event, bound: 'min' | 'max'): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === '' ? null : Number(raw);
    (bound === 'min' ? this.minPrice : this.maxPrice).set(
      value !== null && Number.isFinite(value) ? value : null,
    );
  }
  range(index: number): void {
    const bounds = [
      [null, 100],
      [100, 500],
      [500, 800],
      [800, null],
    ][index];
    const factor = this.ui.currency() === 'CDF' ? this.ui.rate : 1;
    this.minPrice.set(bounds[0] === null ? null : bounds[0] * factor);
    this.maxPrice.set(bounds[1] === null ? null : bounds[1] * factor);
  }
  toggleBrand(name: string): void {
    this.brands.update((a) =>
      a.includes(name) ? a.filter((n) => n !== name) : [...a, name],
    );
  }
  resetFilters(): void {
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.brands.set([]);
    this.condition.set('all');
    this.category.set('all');
  }
  add(name: string, price: number, shop: string): void {
    this.addedNames.update((a) => (a.includes(name) ? a : [...a, name]));
    this.ui.addToCart.next({ name, price, shop });
  }
  added(name: string): boolean {
    return this.addedNames().includes(name);
  }
  setSort(event: Event): void {
    const selected = event.target as HTMLSelectElement;
    this.sort.set(
      ['relevance', 'price-asc', 'price-desc', 'shops'][
        selected.selectedIndex
      ] ?? 'relevance',
    );
  }
  openRecent(query: string): void {
    this.ui.query.set(query);
    this.ui.search();
  }
  removeRecent(query: string): void {
    this.recent.update((a) => a.filter((v) => v !== query));
  }
}
