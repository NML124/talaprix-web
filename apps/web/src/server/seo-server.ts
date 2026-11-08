import type { Express } from 'express';
import { SEO_ORIGIN, seoPolicy } from '@talaprix/shared/utils';

const aliases: Readonly<Record<string, string>> = {
  '/products': '/resultats',
  '/favorites': '/favoris',
  '/cart': '/panier',
  '/shops': '/boutiques',
  '/compte': '/favoris',
  '/optimisation': '/panier',
};

export function registerSeoMiddleware(app: Express): void {
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const production =
      req.hostname === 'talaprix.com' || req.hostname === 'www.talaprix.com';
    if (!production) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const path = req.path.replace(/\/+$/, '') || '/';
    if (!/\.[a-z0-9]{1,8}$/i.test(path) && !seoPolicy(req.originalUrl).index)
      res.setHeader('X-Robots-Tag', 'noindex, follow');
    if (
      /^\/(panier|favoris|optimisation|compte|auth|recherche)(\/|$)/.test(
        path,
      ) ||
      path === '/boutiques/sans-position'
    )
      res.setHeader('X-Robots-Tag', 'noindex, follow');
    // HTML must never be shared between visitors. Static files set their own cache policy.
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET' || req.method === 'HEAD') {
      if (req.hostname === 'www.talaprix.com') {
        res.redirect(308, SEO_ORIGIN + req.originalUrl);
        return;
      }
      const legacyProduct = /^\/products\/([^/]+)$/.exec(path);
      const destination =
        aliases[path] ??
        (legacyProduct ? `/produit/${legacyProduct[1]}` : null);
      if (destination) {
        const query = req.originalUrl.includes('?')
          ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
          : '';
        res.redirect(308, destination + query);
        return;
      }
    }
    next();
  });
  app.get('/healthz', (_req, res) => {
    res.type('text/plain').set('Cache-Control', 'no-store').send('ok');
  });
  app.get('/robots.txt', (req, res) => {
    const production =
      req.hostname === 'talaprix.com' || req.hostname === 'www.talaprix.com';
    res.type('text/plain').setHeader('Cache-Control', 'public, max-age=300');
    // Let crawlers read noindex on private/staging HTML rather than blocking it.
    res.send(
      `User-agent: *\nAllow: /\n${production ? `\nSitemap: ${SEO_ORIGIN}/sitemap.xml\n` : ''}`,
    );
  });
}
