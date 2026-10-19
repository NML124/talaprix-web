import {
  getCountryDataList,
  type TCountryCode,
  type TCurrencyCode,
} from 'countries-list';
import { getCurrency } from 'countries-list/currencies';

export type SettingsTab = 'country' | 'language' | 'currency';
export type LanguageCode = 'FR' | 'EN';

export interface CountryOption {
  readonly code: TCountryCode;
  readonly name: string;
}

export interface CurrencyOption {
  readonly code: TCurrencyCode;
  readonly name: string;
  readonly symbol: string;
}

export interface LanguageOption {
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

export const COUNTRY_OPTIONS: readonly CountryOption[] = countryData
  .map((country) => ({
    code: country.iso2,
    name: frenchRegionNames?.of(country.iso2) ?? country.name,
  }))
  .sort((first, second) => first.name.localeCompare(second.name, 'fr'));

const currencyCodes = new Set<TCurrencyCode>();
for (const country of countryData) {
  for (const currency of country.currency) currencyCodes.add(currency);
}

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [...currencyCodes]
  .map((code) => {
    const currency = getCurrency(code);
    return {
      code,
      name: frenchCurrencyNames?.of(code) ?? currency.native ?? currency.name,
      symbol: currency.symbolNative || currency.symbol || code,
    };
  })
  .sort((first, second) => first.name.localeCompare(second.name, 'fr'));

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'FR', name: 'Français', description: 'Interface en français' },
  { code: 'EN', name: 'English', description: 'Interface in English' },
];

export const DEFAULT_COUNTRY =
  COUNTRY_OPTIONS.find((country) => country.code === 'CD') ??
  COUNTRY_OPTIONS[0];
export const DEFAULT_CURRENCY =
  CURRENCY_OPTIONS.find((currency) => currency.code === 'CDF') ??
  CURRENCY_OPTIONS[0];

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr');
}
