import { paginationUrl, seoImage, seoPolicy, SEO_IMAGE } from './seo';

const category = '11111111-1111-4111-8111-111111111111';
describe('SEO URL policy', () => {
  it('keeps paginated category pages distinct and strips tracking/default page', () => {
    expect(
      seoPolicy(`/resultats?utm_source=test&page=2&category_id=${category}`)
        .canonical,
    ).toBe(`https://talaprix.com/resultats?category_id=${category}&page=2`);
    expect(seoPolicy('/resultats?page=1').canonical).toBe(
      'https://talaprix.com/resultats',
    );
    expect(seoPolicy('/resultats?page=2').index).toBe(true);
    expect(seoPolicy('/?utm_source=test').index).toBe(true);
  });
  it('excludes search, arbitrary faceting, invalid IDs, private and unknown pages', () => {
    for (const raw of [
      '/resultats?q=iphone',
      '/resultats?min_price=10',
      '/resultats?sort=price_asc',
      '/resultats?page=-1',
      '/resultats?page=2&page=3',
      '/resultats?category_id=bad',
      '/panier',
      '/favoris',
      '/recherche',
      '/compte',
      '/produit/inconnu',
      '/absent',
    ])
      expect(seoPolicy(raw).index, raw).toBe(false);
  });
  it('never derives canonical authority from the incoming host', () => {
    expect(
      seoPolicy('https://attacker.invalid/resultats?page=2').canonical,
    ).toBe('https://talaprix.com/resultats?page=2');
    expect(seoPolicy(`/produit/${category}?utm_campaign=test`).index).toBe(
      true,
    );
  });
  it('produces navigable pagination links without losing selected filters', () => {
    expect(paginationUrl('/resultats?q=iphone&page=3', 2)).toBe(
      '/resultats?q=iphone&page=2',
    );
    expect(paginationUrl('/resultats?q=iphone&page=3', 1)).toBe(
      '/resultats?q=iphone',
    );
  });
  it('uses absolute HTTPS social images and rejects unsafe URLs', () => {
    expect(seoImage('/photo.png')).toBe('https://talaprix.com/photo.png');
    for (const image of [
      'javascript:alert(1)',
      'data:image/png;base64,abc',
      'https://user:pass@example.com/x',
      'http://example.com/x',
    ])
      expect(seoImage(image)).toBe(SEO_IMAGE);
  });
});
