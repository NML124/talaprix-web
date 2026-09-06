import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/products').then(
        ({ ProductsFeatureWeb }) => ProductsFeatureWeb,
      ),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
];
