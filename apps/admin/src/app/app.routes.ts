import { Route } from '@angular/router';
import { runtimeConfig } from '../environments/runtime-config.generated';

const live = Boolean(
  runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey,
);
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
          import('@talaprix/admin').then(
            ({ AdminLiveOverview, OverviewPage }) =>
              live ? AdminLiveOverview : OverviewPage,
          ),
      },
      {
        path: 'rapports',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ReportsPage, AdminUnavailable }) =>
            live ? AdminUnavailable : ReportsPage,
          ),
      },
      {
        path: 'scraping',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ ScrapingPage, AdminUnavailable }) =>
              live ? AdminUnavailable : ScrapingPage,
          ),
      },
      {
        path: 'catalogue',
        data: { resource: 'products' },
        loadComponent: () =>
          import('@talaprix/admin').then(({ AdminLiveList, CataloguePage }) =>
            live ? AdminLiveList : CataloguePage,
          ),
      },
      {
        path: 'offres',
        data: { resource: 'offers' },
        loadComponent: () =>
          import('@talaprix/admin').then(({ AdminLiveList, OffersPage }) =>
            live ? AdminLiveList : OffersPage,
          ),
      },
      {
        path: 'categories',
        data: { resource: 'categories' },
        loadComponent: () =>
          import('@talaprix/admin').then(({ AdminLiveList, CategoriesPage }) =>
            live ? AdminLiveList : CategoriesPage,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ NotificationsPage, AdminUnavailable }) =>
              live ? AdminUnavailable : NotificationsPage,
          ),
      },
      {
        path: 'boutiques',
        data: { resource: 'shops' },
        loadComponent: () =>
          import('@talaprix/admin').then(({ AdminLiveList, ShopsPage }) =>
            live ? AdminLiveList : ShopsPage,
          ),
      },
      {
        path: 'publicites',
        loadComponent: () =>
          import('@talaprix/admin').then(
            ({ AdvertisementsPage, AdminUnavailable }) =>
              live ? AdminUnavailable : AdvertisementsPage,
          ),
      },
      {
        path: 'marketing',
        redirectTo: 'publicites',
        pathMatch: 'full',
      },
      {
        path: 'utilisateurs',
        data: { resource: 'users' },
        loadComponent: () =>
          import('@talaprix/admin').then(({ AdminLiveList, UsersPage }) =>
            live ? AdminLiveList : UsersPage,
          ),
      },
      {
        path: 'equipe',
        loadComponent: () =>
          import('@talaprix/admin').then(({ TeamPage, AdminUnavailable }) =>
            live ? AdminUnavailable : TeamPage,
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('@talaprix/admin').then(({ RolesPage, AdminUnavailable }) =>
            live ? AdminUnavailable : RolesPage,
          ),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('@talaprix/admin').then(({ ProfilePage, AdminUnavailable }) =>
            live ? AdminUnavailable : ProfilePage,
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
];
