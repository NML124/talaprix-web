import { PLATFORM_ID, REQUEST, RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageSeo } from './page-seo';

describe('PageSeo', () => {
  function setup(host = 'talaprix.com', response: ResponseInit | null = null) {
    TestBed.configureTestingModule({
      providers: [
        PageSeo,
        { provide: RESPONSE_INIT, useValue: response },
        { provide: REQUEST, useValue: new Request(`https://${host}/`) },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    return TestBed.inject(PageSeo);
  }
  beforeEach(() => {
    document.head.innerHTML = '';
  });
  it('replaces duplicate canonicals and updates all metadata on SPA navigation', () => {
    document.head.innerHTML =
      '<link rel="canonical" href="https://wrong.invalid"><link rel="canonical" href="https://wrong.invalid/2">';
    const seo = setup();
    seo.update({
      title: 'Catalogue',
      description: 'Produits',
      canonical: '/resultats?page=2',
      index: true,
    });
    expect(document.title).toBe('Catalogue');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link')?.getAttribute('href')).toBe(
      'https://talaprix.com/resultats?page=2',
    );
    seo.update({
      title: 'Panier',
      description: 'Personnel',
      canonical: '/panier',
      index: false,
    });
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content'),
    ).toBe('Panier');
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute('content'),
    ).toBe('Panier');
  });
  it('keeps staging unindexable even when a feature requests indexing', () => {
    setup('staging.talaprix.com').update({
      title: 'Test',
      description: 'Test',
      canonical: '/',
      index: true,
    });
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
  });
  it('marks a temporary failure as noindex and HTTP 503 with Retry-After', () => {
    const response: ResponseInit = {};
    const seo = setup('talaprix.com', response);
    seo.unavailable();
    expect(response.status).toBe(503);
    expect(new Headers(response.headers).get('Retry-After')).toBe('60');
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
  });
  it('serializes hostile product text as inert JSON and removes obsolete data', () => {
    const seo = setup();
    const name = '</script><img src=x onerror=alert(1)>';
    seo.jsonLd('test-jsonld', { name });
    const script = document.getElementById('test-jsonld');
    expect(script?.textContent).not.toContain('<');
    expect(JSON.parse(script?.textContent ?? '{}').name).toBe(name);
    expect(document.querySelector('img')).toBeNull();
    seo.clearJsonLd('test-jsonld');
    expect(document.getElementById('test-jsonld')).toBeNull();
  });
});
