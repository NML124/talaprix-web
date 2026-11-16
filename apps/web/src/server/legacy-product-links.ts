import type { Express } from 'express';
import { SEO_UUID } from '@talaprix/shared/utils';

interface Config {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
}

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Resolve old mobile product IDs against the public catalogue, without writes. */
export function registerLegacyProductLinks(app: Express, config: Config): void {
  app.get('/detail-product/:id', async (req, res) => {
    const id = req.params['id'];
    res.set('Cache-Control', 'no-store');
    if (!SEO_UUID.test(id)) {
      res.status(404).send('Produit introuvable.');
      return;
    }
    try {
      if (!config.supabaseUrl.startsWith('https://') || !config.supabaseAnonKey)
        throw new Error('Missing catalogue configuration');
      const headers = {
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      };
      const read = async (path: string, params: Record<string, string>) => {
        const url = new URL(`/functions/v1/${path}`, config.supabaseUrl);
        url.search = new URLSearchParams(params).toString();
        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error('Catalogue unavailable');
        return response.json() as Promise<unknown>;
      };
      const details = await read('get-product-offers', {
        product_id: id,
        limit: '1',
      });
      if (!record(details) || !('product' in details))
        throw new Error('Invalid product response');
      if (details['product'] === null) {
        res.status(404).send('Produit introuvable.');
        return;
      }
      if (
        !record(details['product']) ||
        typeof details['product']['name'] !== 'string'
      )
        throw new Error('Invalid product response');
      const query = details['product']['name'].trim().slice(0, 100);
      if (!query) throw new Error('Missing product name');
      for (let page = 1; page <= 20; page++) {
        const data = await read('get-offer-references', {
          q: query,
          page: String(page),
          limit: '100',
          sort: 'name_asc',
        });
        if (
          !record(data) ||
          !Array.isArray(data['data']) ||
          !record(data['pagination'])
        )
          throw new Error('Invalid catalogue response');
        const match = data['data'].find(
          (item: unknown) =>
            record(item) &&
            item['product_id'] === id &&
            typeof item['offer_reference_id'] === 'string' &&
            SEO_UUID.test(item['offer_reference_id']),
        );
        if (record(match) && typeof match['offer_reference_id'] === 'string') {
          res.redirect(302, `/produit/${match['offer_reference_id']}`);
          return;
        }
        const pages = Number(data['pagination']['totalPages']);
        if (!Number.isInteger(pages) || pages < 0)
          throw new Error('Invalid pagination');
        if (page >= pages) {
          res.status(404).send('Produit introuvable.');
          return;
        }
      }
      throw new Error('Catalogue search limit reached');
    } catch {
      res.status(503).send('Produit temporairement indisponible.');
    }
  });
}
