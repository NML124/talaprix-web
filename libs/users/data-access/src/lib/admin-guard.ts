import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthSessionStore } from './auth-session-store';

export const adminGuard: CanMatchFn = (_route, segments) => {
  const session = inject(AuthSessionStore);
  const router = inject(Router);
  const user = session.user();

  return user?.roles.includes('admin') ||
    user?.roles.includes('catalog-manager') ||
    user?.roles.includes('scraper-operator')
    ? true
    : router.createUrlTree(['/auth'], {
        queryParams: {
          returnUrl: `/${segments.map(({ path }) => path).join('/')}`,
        },
      });
};
