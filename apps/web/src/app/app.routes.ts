import { Route } from '@angular/router';
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/home/feature-web').then((m) => m.ClientShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@talaprix/home/feature-web').then((m) => m.ClientHome),
      },
      {
        path: 'resultats',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientResults),
      },
      {
        path: 'recherche',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientSearch),
      },
      {
        path: 'produit/:slug',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientDetail),
      },
      {
        path: 'compte',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientAccount),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then(
            (m) => m.ClientCategories,
          ),
      },
      {
        path: 'boutiques',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) => m.ClientShopPage),
      },
      {
        path: 'boutiques/sans-position',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) => m.ClientUnlocated),
      },
      {
        path: 'commercants',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) => m.ClientMerchants),
      },
      {
        path: 'panier',
        loadComponent: () =>
          import('@talaprix/cart/feature-web').then((m) => m.ClientCart),
      },
      { path: 'products', redirectTo: 'resultats', pathMatch: 'full' },
      { path: 'products/:id', redirectTo: 'produit/:id', pathMatch: 'full' },
      { path: 'favorites', redirectTo: 'compte', pathMatch: 'full' },
      { path: 'cart', redirectTo: 'panier', pathMatch: 'full' },
      { path: 'shops', redirectTo: 'boutiques', pathMatch: 'full' },
      { path: 'auth', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ],
  },
];
