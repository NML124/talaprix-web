import { Route } from '@angular/router';
import { runtimeConfig } from '../environments/runtime-config.generated';
const live = Boolean(
  runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey,
);
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('@talaprix/home/feature-web').then((m) => m.ClientShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'TalaPrix : comparez les prix des boutiques de Kinshasa',
        loadComponent: () =>
          import('@talaprix/home/feature-web').then((m) => m.ClientHome),
      },
      {
        path: 'resultats',
        title: 'Tous les produits et leurs prix | TalaPrix',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientResults),
      },
      {
        path: 'recherche',
        title: 'Rechercher un produit | TalaPrix',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) =>
            live ? m.ClientLiveSearch : m.ClientSearch,
          ),
      },
      {
        path: 'produit/:slug',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) => m.ClientDetail),
      },
      { path: 'compte', redirectTo: 'favoris', pathMatch: 'full' },
      {
        path: 'favoris',
        title: 'Mes favoris | TalaPrix',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) =>
            live ? m.ClientLiveFavorites : m.ClientFavoritesPage,
          ),
      },
      {
        path: 'categories',
        title: 'Toutes les catégories | TalaPrix',
        loadComponent: () =>
          import('@talaprix/products/feature-web').then((m) =>
            live ? m.ClientLiveCategories : m.ClientCategories,
          ),
      },
      {
        path: 'boutiques',
        title: 'Boutiques à Kinshasa | TalaPrix',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) =>
            live ? m.ClientLiveShops : m.ClientShopPage,
          ),
      },
      {
        path: 'boutiques/sans-position',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) => m.ClientUnlocated),
      },
      {
        path: 'commercants',
        title: 'Inscrire ma boutique sur TalaPrix',
        loadComponent: () =>
          import('@talaprix/shops/feature-web').then((m) => m.ClientMerchants),
      },
      {
        path: 'panier',
        title: 'Mon panier | TalaPrix',
        loadComponent: () =>
          import('@talaprix/cart/feature-web').then((m) =>
            live ? m.ClientLiveCart : m.ClientCart,
          ),
      },
      {
        path: 'optimisation',
        title: 'Optimiser mes achats | TalaPrix',
        loadComponent: () =>
          import('@talaprix/cart/feature-web').then(
            (m) => m.ClientLiveOptimization,
          ),
      },
      {
        path: 'contact',
        title: 'Nous contacter | TalaPrix',
        loadComponent: () =>
          import('@talaprix/home/feature-web').then((m) => m.ClientContactPage),
      },
      ...[
        'conditions-utilisation',
        'conditions-consommateur',
        'politique-utilisation',
        'confidentialite',
        'suppression-donnees',
        'aide',
      ].map(
        (legal): Route => ({
          path: legal,
          data: { legal },
          loadComponent: () =>
            import('@talaprix/home/feature-web').then((m) => m.ClientLegalPage),
        }),
      ),
      { path: 'products', redirectTo: 'resultats', pathMatch: 'full' },
      { path: 'products/:id', redirectTo: 'produit/:id', pathMatch: 'full' },
      { path: 'favorites', redirectTo: 'favoris', pathMatch: 'full' },
      { path: 'cart', redirectTo: 'panier', pathMatch: 'full' },
      { path: 'shops', redirectTo: 'boutiques', pathMatch: 'full' },
      { path: 'auth', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ],
  },
];
