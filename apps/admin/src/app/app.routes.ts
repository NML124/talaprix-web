import { Route } from '@angular/router';
import { adminGuard } from '@talaprix/users/data-access';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users/feature-auth').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
  {
    path: 'products',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('@talaprix/products/feature-admin').then(
        ({ ProductsFeatureAdmin }) => ProductsFeatureAdmin,
      ),
  },
  {
    path: 'scrapers',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('@talaprix/scrapers/feature-admin').then(
        ({ ScrapersFeatureAdmin }) => ScrapersFeatureAdmin,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'products' },
];
