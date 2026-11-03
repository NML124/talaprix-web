import { CartPreviewStore } from '@talaprix/cart/data-access';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  AuthSessionStore,
  provideAuthDataAccess,
} from '@talaprix/users/data-access';
import {
  provideHeaderSearch,
  provideMapboxConfig,
  provideSupabaseConfig,
} from '@talaprix/shared/data-access';
import {
  AUDIENCE_ANALYTICS_TOKEN,
  provideHomeDataAccess,
} from '@talaprix/home/data-access';
import {
  provideCartDataAccess,
  provideOfferCart,
} from '@talaprix/cart/data-access';
import { provideShopDataAccess } from '@talaprix/shops/data-access';
import {
  provideCategoriesDataAccess,
  provideProductDataAccess,
} from '@talaprix/products/data-access';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  mapboxConfig,
  runtimeConfig,
  webAnalyticsToken,
} from '../environments/runtime-config.generated';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
    provideSupabaseConfig(runtimeConfig),
    { provide: AUDIENCE_ANALYTICS_TOKEN, useValue: webAnalyticsToken },
    provideMapboxConfig(mapboxConfig),
    provideHeaderSearch(() =>
      import('@talaprix/products/feature-web').then(
        (m) => m.ClientHeaderSearch,
      ),
    ),
    provideAuthDataAccess(),
    provideAppInitializer(() => inject(AuthSessionStore).initialize()),
    provideCategoriesDataAccess(),
    provideProductDataAccess(),
    provideCartDataAccess(),
    provideOfferCart(),
    provideShopDataAccess(),
    provideHomeDataAccess(),
    provideAppInitializer(() => {
      inject(CartPreviewStore);
    }),
  ],
};
