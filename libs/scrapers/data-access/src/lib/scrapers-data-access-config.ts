import {
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';

export interface ScrapersDataAccessConfig {
  readonly apiBaseUrl: string;
}

export const SCRAPERS_DATA_ACCESS_CONFIG =
  new InjectionToken<ScrapersDataAccessConfig>('SCRAPERS_DATA_ACCESS_CONFIG');

export function provideScrapersDataAccess(
  config: ScrapersDataAccessConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SCRAPERS_DATA_ACCESS_CONFIG, useValue: Object.freeze(config) },
  ]);
}
