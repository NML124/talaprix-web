import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/home/feature-web').then(({ Home }) => Home),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
];
