import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideCheck,
  LucideChevronDown,
  LucideChevronRight,
  LucideCircleDollarSign,
  LucideGlobe2,
  LucideLanguages,
  LucideMenu,
  LucideQrCode,
  LucideSearch,
  LucideShoppingBasket,
  LucideUserRound,
  LucideX,
} from '@lucide/angular';
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
  imports: [
    LucideCheck,
    LucideChevronDown,
    LucideChevronRight,
    LucideCircleDollarSign,
    LucideGlobe2,
    LucideLanguages,
    LucideMenu,
    LucideQrCode,
    LucideSearch,
    LucideShoppingBasket,
    LucideUserRound,
    LucideX,
  ],
  templateUrl: './home-navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeNavbar {
  private readonly localeSettings =
    viewChild<ElementRef<HTMLElement>>('localeSettings');

  protected readonly countries = COUNTRY_OPTIONS;
  protected readonly currencies = CURRENCY_OPTIONS;
  protected readonly languages = LANGUAGE_OPTIONS;
  protected readonly isLocaleOpen = signal(false);
  protected readonly isMobileMenuOpen = signal(false);
  protected readonly activeSettingsTab = signal<SettingsTab>('country');
  protected readonly selectedCountry = signal<CountryOption>(DEFAULT_COUNTRY);
  protected readonly selectedLanguage = signal<LanguageCode>('FR');
  protected readonly selectedCurrency =
    signal<CurrencyOption>(DEFAULT_CURRENCY);
  protected readonly countryQuery = signal('');
  protected readonly currencyQuery = signal('');

  protected readonly filteredCountries = computed(() => {
    const query = this.normalize(this.countryQuery());

    if (!query) {
      return this.countries;
    }

    return this.countries.filter((country) =>
      this.normalize(`${country.name} ${country.code}`).includes(query),
    );
  });

  protected readonly filteredCurrencies = computed(() => {
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

  protected toggleLocale(): void {
    this.isLocaleOpen.update((isOpen) => !isOpen);
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected setActiveTab(tab: SettingsTab): void {
    this.activeSettingsTab.set(tab);
  }

  protected selectCountry(country: CountryOption): void {
    this.selectedCountry.set(country);
  }

  protected selectLanguage(language: LanguageCode): void {
    this.selectedLanguage.set(language);
  }

  protected selectCurrency(currency: CurrencyOption): void {
    this.selectedCurrency.set(currency);
  }

  protected updateCountryQuery(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.countryQuery.set(input.value);
    }
  }

  protected updateCurrencyQuery(event: Event): void {
    const input = event.target;

    if (input instanceof HTMLInputElement) {
      this.currencyQuery.set(input.value);
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  protected closeWhenClickingOutside(event: PointerEvent): void {
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
  protected closeWithEscape(): void {
    this.isLocaleOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr');
  }
}