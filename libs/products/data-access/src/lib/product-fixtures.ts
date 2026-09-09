import type { ProductDetail } from '@talaprix/products/domain';

const currency = 'CDF';

export const PRODUCT_FIXTURES: readonly ProductDetail[] = [
  product(
    'galaxy-a54',
    'Samsung Galaxy A54',
    'Samsung',
    'Téléphones',
    680000,
    740000,
    4,
  ),
  product(
    'iphone-14',
    'iPhone 14 128 Go',
    'Apple',
    'Téléphones',
    1320000,
    1500000,
    3,
  ),
  product(
    'hp-pavilion',
    'HP Pavilion 15',
    'HP',
    'Informatique',
    1250000,
    1350000,
    3,
  ),
  product('airpods-pro', 'AirPods Pro 2', 'Apple', 'Audio', 420000, 480000, 2),
  product(
    'dell-inspiron',
    'Dell Inspiron 14',
    'Dell',
    'Informatique',
    720000,
    780000,
    3,
  ),
  product(
    'logitech-mx',
    'Logitech MX Master 3S',
    'Logitech',
    'Informatique',
    99000,
    117000,
    2,
  ),
  product(
    'samsung-monitor',
    'Samsung 24 pouces FHD',
    'Samsung',
    'TV & Audio',
    180000,
    209000,
    3,
  ),
  product(
    'lenovo-bag',
    'Sac à dos Lenovo',
    'Lenovo',
    'Accessoires',
    45000,
    null,
    2,
  ),
];

function product(
  id: string,
  name: string,
  brandName: string,
  categoryName: string,
  amount: number,
  oldAmount: number | null,
  offerCount: number,
): ProductDetail {
  const price = { amount, currency };
  const oldPrice = oldAmount === null ? null : { amount: oldAmount, currency };
  return {
    id,
    name,
    brandName,
    categoryName,
    categoryId: categoryName.toLowerCase().replace(/ /g, '-'),
    imageUrl: null,
    gallery: [],
    lowestPrice: price,
    oldPrice,
    offerCount,
    merchantName: 'Boutiques partenaires',
    stockStatus: 'in-stock',
    verified: true,
    description: `${name} : comparez les offres des boutiques partenaires à Kinshasa.`,
    offers: Array.from({ length: offerCount }, (_, index) => ({
      id: `${id}-offer-${index + 1}`,
      shopId: `shop-${index + 1}`,
      shopName:
        ['Afrimarket', 'Jumia', 'Technomarket', 'Vodacom Shop'][index] ??
        'Partenaire',
      shopAddress: ['Gombe', 'Kinshasa', 'Ngaliema'][index] ?? null,
      price: { amount: amount + index * 20000, currency },
      oldPrice: index === 0 ? oldPrice : null,
      inStock: index !== offerCount - 1,
      deliveryLabel:
        index === 1 ? 'Retrait en boutique' : 'Livraison disponible',
    })),
  };
}
