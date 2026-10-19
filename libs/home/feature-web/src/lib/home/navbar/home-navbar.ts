import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesStore, ProductStore } from '@talaprix/products/data-access';
import { AuthSessionStore } from '@talaprix/users/data-access';
import { HomeNavbarDesktop } from './desktop/home-navbar-desktop';
import { HomeNavbarDrawer } from './drawer/home-navbar-drawer';
import { HomeNavbarMobile } from './mobile/home-navbar-mobile';
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  LANGUAGE_OPTIONS,
  normalizeSearch,
  type CountryOption,
  type CurrencyOption,
  type LanguageCode,
  type SettingsTab,
} from './navbar-locale-options';

@Component({
  selector: 'lib-home-navbar',
  imports: [HomeNavbarDesktop, HomeNavbarDrawer, HomeNavbarMobile],
  templateUrl: './home-navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbar {
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly #document = inject(DOCUMENT);
  readonly #destroyRef = inject(DestroyRef);
  readonly #router = inject(Router);
  readonly #auth = inject(AuthSessionStore);
  readonly #products = inject(ProductStore);
  readonly #favorites = inject(FavoritesStore);
  private readonly localeSettings =
    viewChild<ElementRef<HTMLElement>>('localeSettings');
  #lockedScrollY = 0;
  #bodyStyleSnapshot: {
    readonly overflow: string;
    readonly position: string;
    readonly top: string;
    readonly width: string;
  } | null = null;

  public readonly countries = COUNTRY_OPTIONS;
  public readonly currencies = CURRENCY_OPTIONS;
  public readonly languages = LANGUAGE_OPTIONS;
  public readonly isLocaleOpen = signal(false);
  public readonly isSearchOpen = signal(false);
  public readonly isDownloadOpen = signal(false);
  public readonly isMobileMenuOpen = signal(false);
  public readonly activeSettingsTab = signal<SettingsTab>('country');
  public readonly selectedCountry = signal<CountryOption>(DEFAULT_COUNTRY);
  public readonly selectedLanguage = signal<LanguageCode>('FR');
  public readonly selectedCurrency = signal<CurrencyOption>(DEFAULT_CURRENCY);
  public readonly countryQuery = signal('');
  public readonly currencyQuery = signal('');
  public readonly isScrolled = signal(false);
  public readonly searchQuery = signal('');
  public readonly favoriteCount = this.#favorites.count;
  public readonly user = this.#auth.user;
  public readonly isAuthenticated = this.#auth.isAuthenticated;
  public readonly userDisplayName = computed(
    () => this.user()?.displayName || 'Se connecter',
  );
  public readonly avatarUrl = computed(() => {
    const candidate = this.user()?.avatarUrl;
    return candidate && this.isHttpsUrl(candidate) ? candidate : null;
  });
  public readonly searchSuggestions = computed(() => {
    const query = normalizeSearch(this.searchQuery().trim());
    const products = this.#products.items();
    if (!query) return products.slice(0, 4);
    return products
      .filter((product) =>
        normalizeSearch(
          `${product.name} ${product.brandName ?? ''} ${product.categoryName ?? ''}`,
        ).includes(query),
      )
      .slice(0, 5);
  });
  readonly mobileMenuScrollLock = effect(() => {
    if (!this.#isBrowser) return;

    if (this.isMobileMenuOpen()) {
      this.lockPageScroll();
      return;
    }

    this.restorePageScroll();
  });

  public readonly filteredCountries = computed(() => {
    const query = normalizeSearch(this.countryQuery());

    if (!query) {
      return this.countries;
    }

    return this.countries.filter((country) =>
      normalizeSearch(`${country.name} ${country.code}`).includes(query),
    );
  });

  public readonly filteredCurrencies = computed(() => {
    const query = normalizeSearch(this.currencyQuery());

    if (!query) {
      return this.currencies;
    }

    return this.currencies.filter((currency) =>
      normalizeSearch(
        `${currency.name} ${currency.code} ${currency.symbol}`,
      ).includes(query),
    );
  });

  public toggleLocale(): void {
    this.closeSearch();
    this.closeDownload();
    this.isLocaleOpen.update((isOpen) => !isOpen);
  }

  public toggleMobileMenu(): void {
    this.closePopovers();
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  public openSearch(): void {
    this.isLocaleOpen.set(false);
    this.closeDownload();
    this.isSearchOpen.set(true);
    void this.#products.load();
  }

  public closeSearch(): void {
    this.isSearchOpen.set(false);
  }

  public updateSearchQuery(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.searchQuery.set(input.value);
  }

  public submitSearch(): void {
    const query = this.searchQuery().trim();
    this.closeSearch();
    void this.#router.navigate(['/products'], {
      queryParams: query ? { query } : undefined,
    });
  }

  public openProduct(productId: string): void {
    this.closeSearch();
    void this.#router.navigate(['/products', productId]);
  }

  public toggleDownload(): void {
    this.isLocaleOpen.set(false);
    this.closeSearch();
    this.isDownloadOpen.update((isOpen) => !isOpen);
  }

  public closeDownload(): void {
    this.isDownloadOpen.set(false);
  }

  public setActiveTab(tab: SettingsTab): void {
    this.activeSettingsTab.set(tab);
  }

  public selectCountry(country: CountryOption): void {
    this.selectedCountry.set(country);
  }

  public selectLanguage(language: LanguageCode): void {
    this.selectedLanguage.set(language);
  }

  public selectCurrency(currency: CurrencyOption): void {
    this.selectedCurrency.set(currency);
  }

  public updateCountryQuery(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.countryQuery.set(input.value);
    }
  }

  public updateCurrencyQuery(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.currencyQuery.set(input.value);
    }
  }

  @HostListener('window:scroll')
  public updateScrollState(): void {
    if (this.#isBrowser) this.isScrolled.set(window.scrollY > 8);
  }

  @HostListener('document:pointerdown', ['$event'])
  public closeWhenClickingOutside(event: PointerEvent): void {
    const localeElem = this.localeSettings()?.nativeElement;
    if (
      this.isLocaleOpen() &&
      localeElem &&
      !localeElem.contains(event.target as Node)
    ) {
      this.isLocaleOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  public closeWithEscape(): void {
    this.closePopovers();
    this.isMobileMenuOpen.set(false);
  }

  private closePopovers(): void {
    this.isLocaleOpen.set(false);
    this.closeSearch();
    this.closeDownload();
  }

  private lockPageScroll(): void {
    if (this.#bodyStyleSnapshot) return;

    const body = this.#document.body;
    this.#lockedScrollY = window.scrollY;
    this.#bodyStyleSnapshot = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${this.#lockedScrollY}px`;
    body.style.width = '100%';
    this.#destroyRef.onDestroy(() => this.restorePageScroll());
  }

  private restorePageScroll(): void {
    const styleSnapshot = this.#bodyStyleSnapshot;
    if (!styleSnapshot) return;

    const body = this.#document.body;
    body.style.overflow = styleSnapshot.overflow;
    body.style.position = styleSnapshot.position;
    body.style.top = styleSnapshot.top;
    body.style.width = styleSnapshot.width;
    this.#bodyStyleSnapshot = null;
    window.scrollTo({ top: this.#lockedScrollY, behavior: 'instant' });
  }

  private isHttpsUrl(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }
}
