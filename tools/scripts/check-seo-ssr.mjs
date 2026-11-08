import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { JSDOM, VirtualConsole } from 'jsdom';

const id = '11111111-1111-4111-8111-111111111111';
const category = '22222222-2222-4222-8222-222222222222';
const missing = '33333333-3333-4333-8333-333333333333';
const unavailable = '44444444-4444-4444-8444-444444444444';
const port = 4900;
const child = spawn(
  process.execPath,
  [
    '--import',
    pathToFileURL(resolve('tools/scripts/seo-fixture.mjs')).href,
    resolve('dist/apps/web/server/server.mjs'),
  ],
  {
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let log = '';
child.stdout.on('data', (data) => {
  log = (log + data).slice(-4000);
});
child.stderr.on('data', (data) => {
  log = (log + data).slice(-4000);
});
function get(path, host = 'talaprix.com', extra = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      { hostname: '127.0.0.1', port, path, headers: { Host: host, ...extra } },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (data) => {
          body += data;
        });
        res.on('end', () =>
          resolve({ status: res.statusCode, headers: res.headers, body }),
        );
      },
    );
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('SEO response timeout')));
    req.end();
  });
}
function page(response, canonical, index) {
  const dom = new JSDOM(response.body, {
    virtualConsole: new VirtualConsole(),
  });
  const doc = dom.window.document;
  assert.equal(doc.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.equal(doc.querySelector('link[rel="canonical"]').href, canonical);
  const robots = doc.querySelector('meta[name="robots"]')?.content;
  assert.ok(
    robots?.startsWith(index ? 'index,' : 'noindex,'),
    `Unexpected robots: ${robots}`,
  );
  assert.ok(
    doc
      .querySelector('meta[property="og:image"]')
      ?.content.startsWith('https://'),
  );
  return { dom, doc };
}

try {
  let ready = false;
  for (let count = 0; count < 100; count++) {
    if (child.exitCode !== null) throw new Error(`SSR child exited: ${log}`);
    try {
      const result = await get('/robots.txt');
      if (result.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await delay(200);
  }
  assert.ok(ready, `SSR child not ready: ${log}`);
  const health = await get('/healthz');
  assert.equal(health.status, 200);
  assert.equal(health.body, 'ok');

  const home = await get('/');
  assert.equal(home.status, 200);
  let view = page(home, 'https://talaprix.com/', true);
  assert.ok(
    view.doc.querySelector(`a[href="/produit/${id}"]`),
    'Product links missing from SSR HTML',
  );
  assert.ok(
    home.body.includes('tpx-public-get:'),
    'Anonymous public transfer state missing',
  );
  view.dom.window.close();

  const results = await get('/resultats?page=2');
  assert.equal(results.status, 200);
  view = page(results, 'https://talaprix.com/resultats?page=2', true);
  assert.ok(view.doc.title.includes('page 2'));
  assert.ok(
    view.doc.querySelector('a[href="/resultats?page=3"]'),
    'Pagination is not crawlable',
  );
  view.dom.window.close();

  const filtered = await get(`/resultats?category_id=${category}&q=test`);
  view = page(
    filtered,
    `https://talaprix.com/resultats?category_id=${category}`,
    false,
  );
  assert.ok(filtered.headers['x-robots-tag']?.includes('noindex'));
  view.dom.window.close();
  const categoryPage = await get(`/resultats?category_id=${category}`);
  view = page(
    categoryPage,
    `https://talaprix.com/resultats?category_id=${category}`,
    true,
  );
  assert.ok(view.doc.title.includes('Audio'));
  view.dom.window.close();

  const product = await get(`/produit/${id}`);
  assert.equal(product.status, 200);
  view = page(product, `https://talaprix.com/produit/${id}`, true);
  const data = JSON.parse(
    view.doc.getElementById('tpx-product-jsonld').textContent,
  );
  assert.deepEqual(
    data.offers.map((group) => [group.priceCurrency, group.offerCount]),
    [
      ['USD', 2],
      ['CDF', 1],
    ],
  );
  assert.ok(!JSON.stringify(data).includes('availability'));
  assert.ok(view.doc.querySelector('#tpx-breadcrumb-jsonld'));
  view.dom.window.close();
  assert.equal((await get(`/produit/${missing}`)).status, 404);
  assert.equal((await get(`/produit/${unavailable}`)).status, 503);
  assert.equal((await get('/produit/identifiant-invalide')).status, 404);
  assert.equal((await get('/page-inconnue-pour-test-seo')).status, 404);
  assert.equal((await get('/resultats?page=999')).status, 404);
  const cart = await get('/panier');
  assert.ok(cart.headers['x-robots-tag']?.includes('noindex'));
  assert.equal(cart.headers['cache-control'], 'no-store');
  const staging = await get('/', 'staging.talaprix.com');
  assert.ok(staging.headers['x-robots-tag']?.includes('noindex'));
  view = page(staging, 'https://talaprix.com/', false);
  view.dom.window.close();
  assert.equal(
    (await get('/products?utm_source=test')).headers.location,
    '/resultats?utm_source=test',
  );
  assert.equal(
    (await get('/resultats?page=2', 'www.talaprix.com')).headers.location,
    'https://talaprix.com/resultats?page=2',
  );

  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.ok(
    sitemap.body.includes('https://talaprix.com/sitemaps/products-3.xml'),
  );
  assert.equal(
    (
      await get('/sitemap.xml', 'talaprix.com', {
        'If-None-Match': sitemap.headers.etag,
      })
    ).status,
    304,
  );
  const products = await get('/sitemaps/products-1.xml');
  assert.equal(products.status, 200);
  assert.ok(products.body.includes(`https://talaprix.com/produit/${id}`));
  assert.ok(!products.body.includes('<lastmod>'));
  assert.equal((await get('/sitemaps/products-500.xml')).status, 503);
  assert.equal((await get('/sitemaps/products-499.xml')).status, 503);
  assert.equal((await get('/sitemaps/products-0.xml')).status, 404);
  assert.equal((await get('/sitemaps/products-999999.xml')).status, 404);
  const legalStaging = await get('/confidentialite', 'staging.talaprix.com');
  assert.ok(legalStaging.headers['x-robots-tag']?.includes('noindex'));
  const robots = await get('/robots.txt');
  assert.ok(robots.body.includes('Sitemap: https://talaprix.com/sitemap.xml'));
  assert.ok(
    !robots.body.includes('Disallow: /panier'),
    'Crawlers must be able to read noindex',
  );
  console.log(
    'SEO SSR checks passed: real HTML, metadata, pagination, JSON-LD, 404/503, staging and sitemaps.',
  );
} catch (error) {
  console.error(log);
  throw error;
} finally {
  child.kill();
}
