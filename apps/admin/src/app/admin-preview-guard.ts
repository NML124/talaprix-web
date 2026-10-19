import { isDevMode } from '@angular/core';
import type { CanMatchFn } from '@angular/router';
import { adminGuard } from '@talaprix/users/data-access';

/** Prévisualisation des données fictives en développement uniquement. */
export const adminPreviewGuard: CanMatchFn = (route, segments, snapshot) =>
  isDevMode() ? true : adminGuard(route, segments, snapshot);
