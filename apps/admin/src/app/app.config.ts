import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideSupabaseConfig } from '@talaprix/shared/data-access';
import {
  AuthSessionStore,
  provideAuthDataAccess,
} from '@talaprix/users/data-access';
import { appRoutes } from './app.routes';
import { runtimeConfig } from '../environments/runtime-config.generated';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideSupabaseConfig(runtimeConfig),
    provideAuthDataAccess(),
    provideAppInitializer(() => inject(AuthSessionStore).initialize()),
  ],
};
