import {
  inject,
  makeEnvironmentProviders,
  Service,
  type EnvironmentProviders,
} from '@angular/core';
import { SupabaseFunctions } from '@talaprix/shared/data-access';

@Service({ autoProvided: false })
export class HomeDataService {
  readonly #functions = inject(SupabaseFunctions);

  getPromotions(signal?: AbortSignal): Promise<unknown> {
    return this.#functions.get('get-pub', undefined, signal);
  }

  getShops(signal?: AbortSignal): Promise<unknown> {
    return this.#functions.get('get-shops-list', undefined, signal);
  }

  getProducts(signal?: AbortSignal): Promise<unknown> {
    return this.#functions.get('get-products', undefined, signal);
  }
}

export function provideHomeDataAccess(): EnvironmentProviders {
  return makeEnvironmentProviders([HomeDataService]);
}
