import { Route } from '@angular/router';
import { adminGuard } from '@talaprix/users/data-access';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('@talaprix/users/feature-auth').then(
        ({ usersFeatureAuthRoutes }) => usersFeatureAuthRoutes,
      ),
  },
  {
    path: 'products',
    canMatch: [adminGuard],
    loadChildren: () =>
      import('@talaprix/products/feature-admin').then(
        ({ productsFeatureAdminRoutes }) => productsFeatureAdminRoutes,
      ),
  },
  {
    path: 'scrapers',
    canMatch: [adminGuard],
    loadChildren: () =>
      import('@talaprix/scrapers/feature-admin').then(
        ({ scrapersFeatureAdminRoutes }) => scrapersFeatureAdminRoutes,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'products' },
];
