import {
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
  type Type,
} from '@angular/core';

/** Loads the search bar component shown in the public header. */
export type HeaderSearchLoader = () => Promise<Type<unknown>>;

/**
 * Search bar rendered inside the public header. The header lives in the home
 * scope while live search belongs to products, so the app plugs it in here;
 * it is loaded lazily to keep the products feature out of the main bundle.
 */
export const HEADER_SEARCH = new InjectionToken<HeaderSearchLoader>(
  'HEADER_SEARCH',
);

export function provideHeaderSearch(
  loader: HeaderSearchLoader,
): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: HEADER_SEARCH, useValue: loader }]);
}
