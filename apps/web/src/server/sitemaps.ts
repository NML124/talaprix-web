import type { Express, Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { SEO_ORIGIN, SEO_PAGES, SEO_UUID } from '@talaprix/shared/utils';

interface Config {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
}
interface Page {
  readonly urls: readonly string[];
  readonly pages: number;
}
const TTL = 300_000;
const LIMIT = 100;
const MAX_PAGES = 500;
const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char] ?? char,
  );
const urlset = (urls: readonly string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join('')}</urlset>`;
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Sitemap reads only the existing public catalog, using the public key. */
export function registerSitemaps(
  app: Express,
  config: Config,
  request: typeof fetch = fetch,
): void {
  const cache = new Map<number, { until: number; value: Promise<Page> }>();

  function load(page: number): Promise<Page> {
    const cached = cache.get(page);
    if (cached && cached.until > Date.now()) return cached.value;
    const value = (async () => {
      if (!config.supabaseUrl.startsWith('https://') || !config.supabaseAnonKey)
        throw new Error('Public catalog unavailable');
      const url = new URL(
        '/functions/v1/get-offer-references',
        config.supabaseUrl,
      );
      url.search = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        sort: 'name_asc',
      }).toString();
      const response = await request(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: 'application/json',
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
      });
      if (!response.ok) throw new Error('Public catalog unavailable');
      const body: unknown = await response.json();
      if (
        !record(body) ||
        !Array.isArray(body['data']) ||
        body['data'].length > LIMIT ||
        !record(body['pagination'])
      )
        throw new Error('Invalid catalog response');
      const pagination = body['pagination'];
      const pages =
        pagination['totalPages'] ??
        (typeof pagination['total'] === 'number'
          ? Math.ceil(pagination['total'] / LIMIT)
          : undefined);
      if (
        typeof pages !== 'number' ||
        !Number.isInteger(pages) ||
        pages < 0 ||
        pages > MAX_PAGES
      )
        throw new Error('Catalog sitemap limit exceeded');
      const urls = body['data'].flatMap((row: unknown) => {
        if (!record(row)) return [];
        const id = row['offer_reference_id'] ?? row['id'];
        return typeof id === 'string' &&
          SEO_UUID.test(id) &&
          typeof (row['product_id'] ?? row['catalog_product_id']) ===
            'string' &&
          typeof row['name'] === 'string' &&
          Number(row['shops_count']) > 0
          ? [`${SEO_ORIGIN}/produit/${encodeURIComponent(id)}`]
          : [];
      });
      return { urls: [...new Set(urls)], pages };
    })();
    if (cache.size >= 100) cache.delete(cache.keys().next().value ?? 0);
    cache.set(page, { until: Date.now() + TTL, value });
    void value.catch(() => {
      if (cache.get(page)?.value === value) cache.delete(page);
    });
    return value;
  }

  function send(req: Request, res: Response, xml: string): void {
    const etag = `"${createHash('sha256').update(xml).digest('hex')}"`;
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      ETag: etag,
    });
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    res.send(xml);
  }
  function unavailable(res: Response): void {
    res
      .set({ 'Cache-Control': 'no-store', 'Retry-After': '60' })
      .status(503)
      .type('text/plain')
      .send('Sitemap temporarily unavailable.');
  }

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const first = await load(1);
      const urls = [
        `${SEO_ORIGIN}/sitemaps/pages.xml`,
        ...Array.from(
          { length: first.pages },
          (_, index) => `${SEO_ORIGIN}/sitemaps/products-${index + 1}.xml`,
        ),
      ];
      send(
        req,
        res,
        `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<sitemap><loc>${escapeXml(url)}</loc></sitemap>`).join('')}</sitemapindex>`,
      );
    } catch {
      unavailable(res);
    }
  });
  app.get('/sitemaps/pages.xml', (req, res) =>
    send(
      req,
      res,
      urlset(
        Object.keys(SEO_PAGES)
          .filter((path) => path !== '/resultats')
          .map((path) => SEO_ORIGIN + path),
      ),
    ),
  );
  app.get('/sitemaps/products-:page.xml', async (req, res) => {
    const raw = req.params['page'];
    const page = Number(raw);
    if (
      !/^\d+$/.test(raw) ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > MAX_PAGES ||
      String(page) !== raw
    ) {
      res.status(404).end();
      return;
    }
    try {
      const value = await load(page);
      if (page > value.pages) {
        res.status(404).end();
        return;
      }
      send(req, res, urlset(value.urls));
    } catch {
      unavailable(res);
    }
  });
}
