import type { ProductDetail } from '@talaprix/products/domain';
import fixtureRowsJson from './product-fixtures.json';

interface ProductFixtureRow {
  readonly id: string;
  readonly name: string;
  readonly brandName: string;
  readonly categoryName: string;
  readonly amount: number;
  readonly oldAmount: number | null;
  readonly offerCount: number;
  readonly shopName: string;
  readonly location: string;
}

const currency = 'CDF';
const fixtureRows = fixtureRowsJson as readonly ProductFixtureRow[];

/** Local fake API payload; replace this adapter when the products endpoint is ready. */
export const PRODUCT_FIXTURES: readonly ProductDetail[] = fixtureRows.map(
  (row) => toProduct(row),
);

function toProduct(row: ProductFixtureRow): ProductDetail {
  const price = { amount: row.amount, currency };
  const oldPrice =
    row.oldAmount === null ? null : { amount: row.oldAmount, currency };

  return {
    id: row.id,
    name: row.name,
    brandName: row.brandName,
    categoryName: row.categoryName,
    categoryId: row.categoryName.toLowerCase().replace(/[^a-z0-9]+/gi, '-'),
    imageUrl: null,
    gallery: [],
    lowestPrice: price,
    oldPrice,
    offerCount: row.offerCount,
    merchantName: row.shopName,
    stockStatus: 'in-stock',
    verified: true,
    description: `${row.name} : comparez les offres des boutiques partenaires à Kinshasa.`,
    offers: Array.from({ length: row.offerCount }, (_, index) => ({
      id: `${row.id}-offer-${index + 1}`,
      shopId: `shop-${index + 1}`,
      shopName:
        index === 0
          ? row.shopName
          : ['Jumia', 'Afrimarket', 'CongoTech'][index % 3],
      shopAddress:
        index === 0
          ? row.location
          : ['Gombe', 'Kinshasa', 'Ngaliema'][index % 3],
      price: { amount: row.amount + index * 20_000, currency },
      oldPrice: index === 0 ? oldPrice : null,
      inStock: index !== row.offerCount - 1,
      deliveryLabel:
        index === 1 ? 'Retrait en boutique' : 'Livraison disponible',
    })),
  };
}
