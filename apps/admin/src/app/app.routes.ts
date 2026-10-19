import { Route } from '@angular/router';
import { adminPreviewGuard } from './admin-preview-guard';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    loadComponent: () =>
      import('@talaprix/users').then(
        ({ UsersFeatureAuth }) => UsersFeatureAuth,
      ),
  },
  {
    path: 'admin',
    canMatch: [adminPreviewGuard],
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
