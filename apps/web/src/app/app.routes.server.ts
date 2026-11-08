import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  ...[
    '',
    'resultats',
    'categories',
    'boutiques',
    'produit/:slug',
    'products/:id',
  ].map((path): ServerRoute => ({ path, renderMode: RenderMode.Server })),
  ...[
    'commercants',
    'contact',
    'aide',
    'conditions-utilisation',
    'conditions-consommateur',
    'politique-utilisation',
    'confidentialite',
    'suppression-donnees',
  ].map((path): ServerRoute => ({ path, renderMode: RenderMode.Prerender })),
  { path: '**', renderMode: RenderMode.Server },
];
