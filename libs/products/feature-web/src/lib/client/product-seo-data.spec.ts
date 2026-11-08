import type {
  CatalogOffer,
  CatalogReference,
} from '@talaprix/products/data-access';
import { productBreadcrumbs, productStructuredData } from './product-seo-data';

const reference: CatalogReference = {
  id: '11111111-1111-4111-8111-111111111111',
  productId: 'p',
  name: 'Produit témoin',
  productName: 'Produit témoin',
  image: 'https://example.com/product.jpg',
  brand: 'Marque',
  categoryId: '22222222-2222-4222-8222-222222222222',
  categoryName: 'Audio',
  price: 100,
  currency: 'USD',
  normalizedPriceCdf: 280000,
  shopsCount: 2,
  condition: null,
  isFavorite: false,
};
function offer(
  id: string,
  price: number,
  currency: 'USD' | 'CDF',
): CatalogOffer {
  return {
    id,
    price,
    currency,
    referenceId: reference.id,
    productId: 'p',
    shopId: id,
    shopName: `Boutique ${id}`,
    shopImage: null,
    shopAddress: null,
    shopLat: null,
    shopLon: null,
    name: 'Produit témoin',
    variantLabel: null,
    image: null,
    normalizedPriceCdf: price,
    condition: null,
    deviseId: null,
    description: null,
    images: [],
    distanceKm: null,
  };
}
describe('visible product structured data', () => {
  it('groups actual prices by currency with truthful counts and no inferred stock', () => {
    const a = offer('a', 100, 'USD');
    const data = productStructuredData(
      reference,
      [
        a,
        a,
        offer('b', 120, 'USD'),
        offer('c', 300000, 'CDF'),
        offer('bad', NaN, 'USD'),
      ],
      'https://talaprix.com/produit/id',
    );
    const groups = Array.isArray(data.offers) ? data.offers : [];
    expect(
      groups.map((group) => [
        group.priceCurrency,
        group.offerCount,
        group.lowPrice,
        group.highPrice,
      ]),
    ).toEqual([
      ['USD', 2, 100, 120],
      ['CDF', 1, 300000, 300000],
    ]);
    const json = JSON.stringify(data);
    expect(json).not.toContain('availability');
    expect(json).not.toContain('aggregateRating');
    expect(json).not.toContain('priceValidUntil');
    expect(json).not.toContain('gtin');
  });
  it('does not invent offers or product imagery when unavailable', () => {
    const data = productStructuredData(
      { ...reference, image: null },
      [],
      'https://talaprix.com/produit/id',
    );
    expect(data.offers).toBeUndefined();
    expect(data.image).toBeUndefined();
  });
  it('uses the same breadcrumb URLs as the visible navigation', () => {
    expect(
      productBreadcrumbs(
        reference,
        'https://talaprix.com/produit/id',
      ).itemListElement.map((item) => item.item),
    ).toEqual([
      'https://talaprix.com/',
      `https://talaprix.com/resultats?category_id=${reference.categoryId}`,
      'https://talaprix.com/produit/id',
    ]);
  });
});
