import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AuthSessionStore } from '@talaprix/users/data-access';

/** Shop routes always require an authenticated shop account, including development. */
export const shopPreviewGuard: CanMatchFn = (_route, segments) => {
  const session = inject(AuthSessionStore);
  if (session.user()?.roles.includes('shop')) return true;
  return inject(Router).createUrlTree(['/auth'], {
    queryParams: {
      returnUrl: `/${segments.map(({ path }) => path).join('/')}`,
    },
  });
};
