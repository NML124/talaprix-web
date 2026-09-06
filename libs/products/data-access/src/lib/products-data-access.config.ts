import {
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';

export interface ProductsDataAccessConfig {
  readonly apiBaseUrl: string;
}

export const PRODUCTS_DATA_ACCESS_CONFIG =
  new InjectionToken<ProductsDataAccessConfig>('PRODUCTS_DATA_ACCESS_CONFIG');

export function provideProductsDataAccess(
  config: ProductsDataAccessConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: PRODUCTS_DATA_ACCESS_CONFIG, useValue: Object.freeze(config) },
  ]);
}
