import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/products/feature-web').then(
        ({ ProductsFeatureWeb }) => ProductsFeatureWeb,
      ),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users/feature-auth').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
];
