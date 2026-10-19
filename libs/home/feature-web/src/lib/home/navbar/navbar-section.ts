import { forwardRef, inject } from '@angular/core';
import { HomeNavbar } from './home-navbar';

export abstract class NavbarSection {
  readonly parent = inject(forwardRef(() => HomeNavbar));
  get countries() {
    return this.parent.countries;
  }
  get currencies() {
    return this.parent.currencies;
  }
  get languages() {
    return this.parent.languages;
  }
  get isLocaleOpen() {
    return this.parent.isLocaleOpen;
  }
  get isSearchOpen() {
    return this.parent.isSearchOpen;
  }
  get isDownloadOpen() {
    return this.parent.isDownloadOpen;
  }
  get isMobileMenuOpen() {
    return this.parent.isMobileMenuOpen;
  }
  get activeSettingsTab() {
    return this.parent.activeSettingsTab;
  }
  get selectedCountry() {
    return this.parent.selectedCountry;
  }
  get selectedLanguage() {
    return this.parent.selectedLanguage;
  }
  get selectedCurrency() {
    return this.parent.selectedCurrency;
  }
  get countryQuery() {
    return this.parent.countryQuery;
  }
  get currencyQuery() {
    return this.parent.currencyQuery;
  }
  get filteredCountries() {
    return this.parent.filteredCountries;
  }
  get filteredCurrencies() {
    return this.parent.filteredCurrencies;
  }
  get searchQuery() {
    return this.parent.searchQuery;
  }
  get searchSuggestions() {
    return this.parent.searchSuggestions;
  }
  get isAuthenticated() {
    return this.parent.isAuthenticated;
  }
  get userDisplayName() {
    return this.parent.userDisplayName;
  }
  get avatarUrl() {
    return this.parent.avatarUrl;
  }
  get favoriteCount() {
    return this.parent.favoriteCount;
  }
  toggleLocale() {
    this.parent.toggleLocale();
  }
  toggleMobileMenu() {
    this.parent.toggleMobileMenu();
  }
  openSearch() {
    this.parent.openSearch();
  }
  closeSearch() {
    this.parent.closeSearch();
  }
  updateSearchQuery(event: Event) {
    this.parent.updateSearchQuery(event);
  }
  submitSearch() {
    this.parent.submitSearch();
  }
  openProduct(productId: string) {
    this.parent.openProduct(productId);
  }
  toggleDownload() {
    this.parent.toggleDownload();
  }
  closeDownload() {
    this.parent.closeDownload();
  }
  setActiveTab(tab: 'country' | 'language' | 'currency') {
    this.parent.setActiveTab(tab);
  }
  selectCountry(country: Parameters<HomeNavbar['selectCountry']>[0]) {
    this.parent.selectCountry(country);
  }
  selectLanguage(language: Parameters<HomeNavbar['selectLanguage']>[0]) {
    this.parent.selectLanguage(language);
  }
  selectCurrency(currency: Parameters<HomeNavbar['selectCurrency']>[0]) {
    this.parent.selectCurrency(currency);
  }
  updateCountryQuery(event: Event) {
    this.parent.updateCountryQuery(event);
  }
  updateCurrencyQuery(event: Event) {
    this.parent.updateCurrencyQuery(event);
  }
}
