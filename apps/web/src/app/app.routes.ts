import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@talaprix/products/feature-web').then(
        ({ productsFeatureWebRoutes }) => productsFeatureWebRoutes,
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('@talaprix/users/feature-auth').then(
        ({ usersFeatureAuthRoutes }) => usersFeatureAuthRoutes,
      ),
  },
];
