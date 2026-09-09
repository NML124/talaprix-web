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
import { HomeNavbarDesktop } from './desktop/home-navbar-desktop';
import { HomeNavbarDrawer } from './drawer/home-navbar-drawer';
import { HomeNavbarMobile } from './mobile/home-navbar-mobile';
import {
  getCountryDataList,
  type TCountryCode,
  type TCurrencyCode,
} from 'countries-list';
import { getCurrency } from 'countries-list/currencies';

type SettingsTab = 'country' | 'language' | 'currency';
type LanguageCode = 'FR' | 'EN';

interface CountryOption {
  readonly code: TCountryCode;
  readonly name: string;
}

interface CurrencyOption {
  readonly code: TCurrencyCode;
  readonly name: string;
  readonly symbol: string;
}

interface LanguageOption {
  readonly code: LanguageCode;
  readonly name: string;
  readonly description: string;
}

interface DisplayNames {
  of(code: string): string | undefined;
}

interface DisplayNamesConstructor {
  new (
    locales: readonly string[],
    options: { readonly type: 'region' | 'currency' },
  ): DisplayNames;
}

const displayNamesConstructor = (
  Intl as unknown as { readonly DisplayNames?: DisplayNamesConstructor }
).DisplayNames;
const frenchRegionNames = displayNamesConstructor
  ? new displayNamesConstructor(['fr'], { type: 'region' })
  : undefined;
const frenchCurrencyNames = displayNamesConstructor
  ? new displayNamesConstructor(['fr'], { type: 'currency' })
  : undefined;

const countryData = getCountryDataList();
const COUNTRY_OPTIONS: readonly CountryOption[] = countryData
  .map((country) => ({
    code: country.iso2,
    name: frenchRegionNames?.of(country.iso2) ?? country.name,
  }))
  .sort((first, second) => first.name.localeCompare(second.name, 'fr'));

const currencyCodes = new Set<TCurrencyCode>();
for (const country of countryData) {
  for (const currency of country.currency) {
    currencyCodes.add(currency);
  }
}

const CURRENCY_OPTIONS: readonly CurrencyOption[] = [...currencyCodes]
  .map((code) => {
    const currency = getCurrency(code);

    return {
      code,
      name: frenchCurrencyNames?.of(code) ?? currency.native ?? currency.name,
      symbol: currency.symbolNative || currency.symbol || code,
    };
  })
  .sort((first, second) => first.name.localeCompare(second.name, 'fr'));

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    code: 'FR',
    name: 'Français',
    description: 'Interface en français',
  },
  {
    code: 'EN',
    name: 'English',
    description: 'Interface in English',
  },
];

const DEFAULT_COUNTRY =
  COUNTRY_OPTIONS.find((country) => country.code === 'CD') ??
  COUNTRY_OPTIONS[0];
const DEFAULT_CURRENCY =
  CURRENCY_OPTIONS.find((currency) => currency.code === 'CDF') ??
  CURRENCY_OPTIONS[0];

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
  public readonly isMobileMenuOpen = signal(false);
  public readonly activeSettingsTab = signal<SettingsTab>('country');
  public readonly selectedCountry = signal<CountryOption>(DEFAULT_COUNTRY);
  public readonly selectedLanguage = signal<LanguageCode>('FR');
  public readonly selectedCurrency = signal<CurrencyOption>(DEFAULT_CURRENCY);
  public readonly countryQuery = signal('');
  public readonly currencyQuery = signal('');
  public readonly isScrolled = signal(false);
  readonly mobileMenuScrollLock = effect(() => {
    if (!this.#isBrowser) return;

    if (this.isMobileMenuOpen()) {
      this.lockPageScroll();
      return;
    }

    this.restorePageScroll();
  });

  public readonly filteredCountries = computed(() => {
    const query = this.normalize(this.countryQuery());

    if (!query) {
      return this.countries;
    }

    return this.countries.filter((country) =>
      this.normalize(`${country.name} ${country.code}`).includes(query),
    );
  });

  public readonly filteredCurrencies = computed(() => {
    const query = this.normalize(this.currencyQuery());

    if (!query) {
      return this.currencies;
    }

    return this.currencies.filter((currency) =>
      this.normalize(
        `${currency.name} ${currency.code} ${currency.symbol}`,
      ).includes(query),
    );
  });

  public toggleLocale(): void {
    this.isLocaleOpen.update((isOpen) => !isOpen);
  }

  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
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
    this.isLocaleOpen.set(false);
    this.isMobileMenuOpen.set(false);
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

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr');
  }
}
