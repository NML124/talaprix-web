import { Route } from '@angular/router';
import { adminGuard } from '@talaprix/users/data-access';
import { shopPreviewGuard } from './shop-preview-guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    data: { privatePortal: true },
    loadComponent: () =>
      import('@talaprix/users').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
  {
    path: 'shop',
    canMatch: [shopPreviewGuard],
    loadComponent: () =>
      import('@talaprix/admin').then(({ ShopShell }) => ShopShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopOverviewPage }) => ShopOverviewPage,
          ),
      },
      {
        path: 'offres',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopOffersPage }) => ShopOffersPage,
          ),
      },
      {
        path: 'reductions',
        redirectTo: 'promotions',
        pathMatch: 'full',
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopReductionsPage }) => ShopReductionsPage,
          ),
      },
      {
        path: 'visibilite',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopVisibilityPage }) => ShopVisibilityPage,
          ),
      },
      {
        path: 'analyses',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopAnalyticsPage }) => ShopAnalyticsPage,
          ),
      },
      {
        path: 'avis',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopReviewsPage }) => ShopReviewsPage,
          ),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ShopSettingsPage }) => ShopSettingsPage,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('@talaprix/admin').then(({ AdminShell }) => AdminShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('@talaprix/admin').then(({ OverviewPage }) => OverviewPage),
      },
      {
        path: 'rapports',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ReportsPage }) => ReportsPage),
      },
      {
        path: 'scraping',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ScrapingPage }) => ScrapingPage),
      },
      {
        path: 'catalogue',
        loadComponent: () =>
          import('@talaprix/admin').then(({ CataloguePage }) => CataloguePage),
      },
      {
        path: 'offres',
        loadComponent: () =>
          import('@talaprix/admin').then(({ OffersPage }) => OffersPage),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ CategoriesPage }) => CategoriesPage,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ NotificationsPage }) => NotificationsPage,
          ),
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ModerationPage }) => ModerationPage,
          ),
      },
      {
        path: 'boutiques',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ShopsPage }) => ShopsPage),
      },
      {
        path: 'recompenses',
        loadComponent: () =>
          import('@talaprix/admin').then(({ RewardsPage }) => RewardsPage),
      },
      {
        path: 'publicites',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ AdvertisementsPage }) => AdvertisementsPage,
          ),
      },
      {
        path: 'marketing',
        loadComponent: () =>
          import('@talaprix/admin').then(({ MarketingPage }) => MarketingPage),
      },
      {
        path: 'utilisateurs',
        loadComponent: () =>
          import('@talaprix/admin').then(({ UsersPage }) => UsersPage),
      },
      {
        path: 'equipe',
        loadComponent: () =>
          import('@talaprix/admin').then(({ TeamPage }) => TeamPage),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('@talaprix/admin').then(({ RolesPage }) => RolesPage),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ProfilePage }) => ProfilePage),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
];
