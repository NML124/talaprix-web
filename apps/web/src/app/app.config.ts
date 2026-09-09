import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  AuthSessionStore,
  provideAuthDataAccess,
} from '@talaprix/users/data-access';
import { provideSupabaseConfig } from '@talaprix/shared/data-access';
import { provideHomeDataAccess } from '@talaprix/home/data-access';
import { provideCategoriesDataAccess } from '@talaprix/products/data-access';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { runtimeConfig } from '../environments/runtime-config.generated';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideSupabaseConfig(runtimeConfig),
    provideAuthDataAccess(),
    provideCategoriesDataAccess(),
    provideHomeDataAccess(),
    provideAppInitializer(() => inject(AuthSessionStore).initialize()),
  ],
};
