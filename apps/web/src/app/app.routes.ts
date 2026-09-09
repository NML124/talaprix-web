import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/home/feature-web').then(
        ({ PublicShell }) => PublicShell,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@talaprix/home/feature-web').then(({ Home }) => Home),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then(
            ({ ProductsCategories }) => ProductsCategories,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then(
            ({ Products }) => Products,
          ),
      },
      {
        path: 'products/:productId',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then(
            ({ ProductDetailPage }) => ProductDetailPage,
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('@talaprix/cart/feature-web').then(({ CartPage }) => CartPage),
      },
      {
        path: 'shops',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then(
            ({ ShopsPage }) => ShopsPage,
          ),
      },
    ],
  },
];
